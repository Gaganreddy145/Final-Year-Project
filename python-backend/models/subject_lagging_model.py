# import pandas as pd
# import pickle
# from sklearn.linear_model import LogisticRegression
# from sklearn.multioutput import MultiOutputClassifier
# from sklearn.model_selection import train_test_split

# # Define your semester-wise subject names.
# subject_names = {
#     1: [
#         "Discrete Mathematical Structures",
#         "English",
#         "Computer Programming with C and Numerical Methods (CPNM)",
#         "Engineering Mathematics – I",
#         "Engineering  Chemistry"
#     ],
#     2: [
#         "Digital Logic Design (DLD)",
#         "Electrical and Electronics Engineering (EEE)",
#         "Engineering Graphics",
#         "Engineering Physics",
#         "Engineering Mathematics – II"
#     ],
#     3: [
#         "Object Oriented Programming through Java",
#         "Operating Systems",
#         "Computer Organization and Architecture",
#         "Data Structures",
#         "Probability, Statistics and Queuing Theory"
#     ],
#     4: [
#         "Managerial Economics",
#         "Formal Languages and Automata Theory",
#         "Database Management Systems",
#         "Design and Analysis of Algorithms",
#         "Microprocessors & Microcontrollers"
#     ],
#     5: [
#         "Data Warehousing and Data Mining",
#         "Compiler Design",
#         "Computer Networks",
#         "Open Elective–I",
#         "Elective-I"
#     ],
#     6: [
#         "Object-Oriented Software Engineering",
#         "Web Technologies",
#         "Artificial Intelligence",
#         "Open Elective-II",
#         "Elective-II"
#     ],
#     7: [
#         "Open Elective-IV",
#         "Open Elective-III",
#         "Elective-V",
#         "Elective–IV",
#         "Elective -III"
#     ]
# }

# def get_subject_marks_columns(semester):
#     """
#     For a given semester, returns:
#       - feature_columns: a list where each subject name is appended with "_mark"
#       - target_columns: a list where each subject name is prefixed with "lag_"
#     """
#     if semester not in subject_names:
#         raise ValueError("Semester not supported.")
#     subjects = subject_names[semester]
#     feature_columns = [f"{subject}_mark" for subject in subjects]
#     target_columns = [f"lag_{subject}" for subject in subjects]
#     return feature_columns, target_columns

# def train_subject_marks_model(semester, csv_file):
#     """
#     Trains a multi-label classification model for the given semester using subject marks.
    
#     Args:
#       semester (int): The semester number.
#       csv_file (str): Path to the CSV file with data for that semester.
      
#     Returns:
#       model: Trained MultiOutputClassifier model.
#       feature_columns: List of feature column names.
#       target_columns: List of target column names.
#     """
#     # Load dataset from CSV
#     data = pd.read_csv(csv_file)
    
#     # Get feature and target columns based on subject names
#     feature_columns, target_columns = get_subject_marks_columns(semester)
    
#     # Prepare features and targets
#     X = data[feature_columns]
#     y = data[target_columns]
    
#     # (Optional) Split into training and test sets for evaluation.
#     X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
#     # Initialize a base classifier (using Logistic Regression) and wrap it for multi-label output.
#     base_model = LogisticRegression(solver="liblinear")
#     model = MultiOutputClassifier(base_model)
    
#     # Train the model
#     model.fit(X_train, y_train)
    
#     # (You can evaluate the model here if needed.)
    
#     return model, feature_columns, target_columns

# def main():
#     # Dictionary to hold models and associated metadata for each semester.
#     subject_models = {}
    
#     # Loop through the supported semesters (1 to 7)
#     for semester in subject_names.keys():
#         csv_file = f"student_data_sem{semester}_marks.csv"  # Make sure these files exist and are properly formatted.
#         print(f"Training model for Semester {semester} using file '{csv_file}'...")
#         try:
#             model, feature_columns, target_columns = train_subject_marks_model(semester, csv_file)
#             subject_models[semester] = {
#                 "model": model,
#                 "feature_columns": feature_columns,
#                 "target_columns": target_columns
#             }
#             print(f"Model for Semester {semester} trained successfully.")
#         except Exception as e:
#             print(f"Error training model for Semester {semester}: {e}")
    
#     # Save all models and metadata into a single pickle file.
#     with open("subject_marks_model.pkl", "wb") as f:
#         pickle.dump(subject_models, f)
    
#     print("All models have been saved to 'subject_marks_model.pkl'.")

# if __name__ == "__main__":
#     main()



import pandas as pd
import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Define your semester-wise subject names.
subject_names = {
    1: [
        "Discrete Mathematical Structures",
        "English",
        "Computer Programming with C and Numerical Methods (CPNM)",
        "Engineering Mathematics – I",
        "Engineering  Chemistry"
    ],
    2: [
        "Digital Logic Design (DLD)",
        "Electrical and Electronics Engineering (EEE)",
        "Engineering Graphics",
        "Engineering Physics",
        "Engineering Mathematics – II"
    ],
    3: [
        "Object Oriented Programming through Java",
        "Operating Systems",
        "Computer Organization and Architecture",
        "Data Structures",
        "Probability, Statistics and Queuing Theory"
    ],
    4: [
        "Managerial Economics",
        "Formal Languages and Automata Theory",
        "Database Management Systems",
        "Design and Analysis of Algorithms",
        "Microprocessors & Microcontrollers"
    ],
    5: [
        "Data Warehousing and Data Mining",
        "Compiler Design",
        "Computer Networks",
        "Open Elective–I",
        "Elective-I"
    ],
    6: [
        "Object-Oriented Software Engineering",
        "Web Technologies",
        "Artificial Intelligence",
        "Open Elective-II",
        "Elective-II"
    ],
    7: [
        "Open Elective-IV",
        "Open Elective-III",
        "Elective-V",
        "Elective–IV",
        "Elective -III"
    ]
}

def get_subject_marks_columns(semester):
    """
    For a given semester, returns:
      - feature_columns: a list where each subject name is appended with "_mark"
      - target_columns: a list where each subject name is prefixed with "lag_"
    """
    if semester not in subject_names:
        raise ValueError("Semester not supported.")
    subjects = subject_names[semester]
    feature_columns = [f"{subject}_mark" for subject in subjects]
    target_columns = [f"lag_{subject}" for subject in subjects]
    return feature_columns, target_columns

def train_subject_marks_model(semester, csv_file):
    """
    Trains a multi-label classification model for the given semester using subject marks.
    
    Args:
      semester (int): The semester number.
      csv_file (str): Path to the CSV file with data for that semester.
      
    Returns:
      model: Trained MultiOutputClassifier model.
      feature_columns: List of feature column names.
      target_columns: List of target column names.
    """
    # Load dataset from CSV
    data = pd.read_csv(csv_file)
    
    # Get feature and target columns based on subject names
    feature_columns, target_columns = get_subject_marks_columns(semester)
    
    # --- Check dataset balance ---
    print(f"\nDataset balance for Semester {semester}:")
    for target in target_columns:
        counts = data[target].value_counts().to_dict()
        print(f"  {target}: {counts}")
    
    # Prepare features and targets
    X = data[feature_columns]
    y = data[target_columns]
    
    # Split into training and test sets for evaluation.
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize a base classifier (using Logistic Regression) and wrap it for multi-label output.
    base_model = LogisticRegression(solver="liblinear")
    model = MultiOutputClassifier(base_model)
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Evaluate the model on the test set
    y_pred = model.predict(X_test)
    print(f"\nClassification Report for Semester {semester}:")
    print(classification_report(y_test, y_pred, target_names=target_columns))
    
    return model, feature_columns, target_columns

def main():
    # Dictionary to hold models and associated metadata for each semester.
    subject_models = {}
    
    # Loop through the supported semesters (1 to 7)
    for semester in subject_names.keys():
        csv_file = f"student_data_sem{semester}_marks.csv"  # Ensure these files exist and are properly formatted.
        print(f"\nTraining model for Semester {semester} using file '{csv_file}'...")
        try:
            model, feature_columns, target_columns = train_subject_marks_model(semester, csv_file)
            subject_models[semester] = {
                "model": model,
                "feature_columns": feature_columns,
                "target_columns": target_columns
            }
            print(f"Model for Semester {semester} trained successfully.")
        except Exception as e:
            print(f"Error training model for Semester {semester}: {e}")
    
    # Save all models and metadata into a single pickle file.
    with open("subject_marks_model.pkl", "wb") as f:
        pickle.dump(subject_models, f)
    
    print("\nAll models have been saved to 'subject_marks_model.pkl'.")

if __name__ == "__main__":
    main()
