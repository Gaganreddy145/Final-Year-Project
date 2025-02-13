from flask import Flask, jsonify, request # type: ignore
import numpy as np # type: ignore
import pandas as pd # type: ignore
import pickle

app = Flask(__name__)

# Load the pickle file containing the models and metadata
with open('balanced_student_model.pkl', 'rb') as f:
    models_dict = pickle.load(f)

# Extract models and feature lists from the loaded dictionary.
first_sem_features = models_dict['first_sem_features']
higher_sem_features = models_dict['higher_sem_features']
model_first_grade = models_dict['model_first_grade']
model_first_pass = models_dict['model_first_pass']
model_higher_grade = models_dict['model_higher_grade']
model_higher_pass = models_dict['model_higher_pass']
kmeans = models_dict['kmeans']

with open('reduced3_feature_student_model.pkl', 'rb') as f:
    models_dict_2 = pickle.load(f)

# Extract models and feature lists.
first_sem_features2 = models_dict_2['first_sem_features2']        # e.g., ['high_school_marks', 'entrance_exam_score', 'attendance']
higher_sem_features2 = models_dict_2['higher_sem_features2']      # e.g., ['prev_sem_grade', 'high_school_marks', 'entrance_exam_score', 'attendance']
model_first_grade2 = models_dict_2['model_first_grade2']
model_first_pass2 = models_dict_2['model_first_pass2']
model_higher_grade2 = models_dict_2['model_higher_grade2']
model_higher_pass2 = models_dict_2['model_higher_pass2']
kmeans2 = models_dict_2['kmeans2']


with open('subject_marks_model.pkl', 'rb') as f:
    subject_models = pickle.load(f)

@app.route("/")
def home():
    # A simple JSON welcome message for the API root.
    return jsonify({"message": "Welcome to the Student Performance Prediction API"})

@app.route("/predict_student", methods=["POST"])
def predict_student():
    try:
        # Get the JSON data from the request
        data = request.get_json(force=True)
        
        # Retrieve the 'semester' value from the JSON data.
        semester = int(data.get('semester', 0))
        if semester not in [1, 2]:
            return jsonify({"error": "Semester must be 1 (first semester) or 2 (higher semester)"}), 400
        
        # Choose the appropriate feature list based on the semester value.
        feature_list = first_sem_features if semester == 1 else higher_sem_features
        
        # Build a dictionary of input features using the expected feature names.
        input_data = {}
        for feat in feature_list:
            val = data.get(feat)
            if val is None or val == '':
                return jsonify({"error": f"Missing value for '{feat}'"}), 400
            try:
                input_data[feat] = float(val)
            except ValueError:
                return jsonify({"error": f"Invalid value for '{feat}'; must be numeric."}), 400
        
        # Create a DataFrame from the input data to match the training structure.
        input_df = pd.DataFrame([input_data])
        
        # Predict final grade and pass/fail status using the appropriate models.
        if semester == 1:
            pred_grade = model_first_grade.predict(input_df)[0]
            pred_pass = model_first_pass.predict(input_df)[0]
        else:
            pred_grade = model_higher_grade.predict(input_df)[0]
            pred_pass = model_higher_pass.predict(input_df)[0]
        
        # Use the KMeans model to determine the performance category based on the predicted final grade.
        cluster = kmeans.predict(np.array([[pred_grade]]))[0]
        centers = kmeans.cluster_centers_.flatten()
        sorted_idx = np.argsort(centers)
        mapping = { sorted_idx[0]: "Low", sorted_idx[1]: "Medium", sorted_idx[2]: "Good" }
        performance_category = mapping.get(cluster, "Unknown")
        
        # Prepare the output as a JSON response.
        result = {
            "predicted_final_grade": round(pred_grade, 2),
            "predicted_pass_fail": "Pass" if pred_pass == 1 else "Fail",
            "performance_category": performance_category
        }
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict_students", methods=["POST"])
def predict_students():
    """
    Predicts for multiple student records.
    Expects JSON payload with either:
    
    1. A list of student records:
       [
         { "rollno": 101, "semester": 2, "prev_sem_grade": 75, "high_school_marks": 80, "entrance_exam_score": 78, "attendance": 95 },
         { "rollno": 102, "semester": 1, "high_school_marks": 65, "entrance_exam_score": 70, "attendance": 85 }
       ]
       
    2. Or an object with a "students" key:
       { "students": [ { ... }, { ... } ] }
       
    Each record must include a unique "rollno", a "semester" (1 or 2), and the required features.
    """
    try:
        data = request.get_json(force=True)
        if isinstance(data, dict) and "students" in data:
            students = data["students"]
        elif isinstance(data, list):
            students = data
        else:
            return jsonify({"error": "Invalid input format. Provide a JSON list or an object with a 'students' key."}), 400

        results = []
        errors = []

        for student in students:
            rollno = student.get("rollno")
            if rollno is None:
                errors.append({"error": "Missing rollno in student record", "student": student})
                continue

            try:
                semester = int(student.get("semester", 0))
                if semester not in [1, 2]:
                    errors.append({"rollno": rollno, "error": "Semester must be 1 or 2"})
                    continue

                # Select feature list based on semester.
                feature_list = first_sem_features2 if semester == 1 else higher_sem_features2

                input_data = {}
                for feat in feature_list:
                    val = student.get(feat)
                    if val is None or val == "":
                        errors.append({"rollno": rollno, "error": f"Missing value for '{feat}'"})
                        raise ValueError("Missing value")
                    try:
                        input_data[feat] = float(val)
                    except ValueError:
                        errors.append({"rollno": rollno, "error": f"Invalid value for '{feat}'"})
                        raise ValueError("Invalid value")

                input_df = pd.DataFrame([input_data])
                if semester == 1:
                    pred_grade = model_first_grade2.predict(input_df)[0]
                    pred_pass = model_first_pass2.predict(input_df)[0]
                else:
                    pred_grade = model_higher_grade2.predict(input_df)[0]
                    pred_pass = model_higher_pass2.predict(input_df)[0]

                cluster = kmeans2.predict(np.array([[pred_grade]]))[0]
                centers = kmeans2.cluster_centers_.flatten()
                sorted_idx = np.argsort(centers)
                mapping = {sorted_idx[0]: "Low", sorted_idx[1]: "Medium", sorted_idx[2]: "Good"}
                performance_category = mapping.get(cluster, "Unknown")

                results.append({
                    "rollno": rollno,
                    "predicted_final_grade": round(pred_grade/10, 2),
                    "predicted_pass_fail": "Pass" if pred_pass == 1 else "Fail",
                    "performance_category": performance_category
                })
            except Exception:
                continue

        # Create a summary grouping students by performance category.
        summary = {}
        for res in results:
            cat = res["performance_category"]
            if cat not in summary:
                summary[cat] = {"count": 0, "rollnos": []}
            summary[cat]["count"] += 1
            summary[cat]["rollnos"].append(res["rollno"])

        response = {
            "results": results,
            "summary": summary
        }
        if errors:
            response["errors"] = errors

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict_lagging_subjects", methods=["POST"])
def predict_lagging_subjects():
    """
    Predicts the subjects in which a student is lagging based on subject-wise marks.
    Expects a JSON payload with:
      - "semester": The semester number (e.g., 1, 2, ..., 8)
      - For each expected feature (e.g., for semester 1: "Math1_mark", "Physics1_mark", etc.)
    Returns a JSON with the list of subjects where the student is predicted to be lagging.
    """
    try:
        data = request.get_json(force=True)
        semester = int(data.get("semester", 0))
        if semester not in subject_models:
            return jsonify({"error": "Invalid semester provided or model not available for this semester"}), 400
        
        model_data = subject_models[semester]
        feature_columns = model_data["feature_columns"]
        target_columns = model_data["target_columns"]
        model = model_data["model"]
        
        input_data = {}
        for feat in feature_columns:
            val = data.get(feat)
            if val is None or val == "":
                return jsonify({"error": f"Missing value for '{feat}'"}), 400
            try:
                input_data[feat] = float(val)
            except ValueError:
                return jsonify({"error": f"Invalid value for '{feat}'; must be numeric."}), 400
        
        input_df = pd.DataFrame([input_data])
        prediction = model.predict(input_df)
        # Remove 'lag_' prefix from target names for clarity.
        lagging_subjects = [target.replace("lag_", "") for target, pred in zip(target_columns, prediction[0]) if pred == 1]
        return jsonify({"lagging_subjects": lagging_subjects})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
