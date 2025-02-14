# train_model.py
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import mean_absolute_error, accuracy_score

# --- Load Training Data from CSV ---
data = pd.read_csv("balanced_student_data_5000.csv")

# --- Data Preprocessing ---
# Ensure that key columns are numeric.
numeric_cols = ['prev_sem_grade', 'high_school_marks', 'entrance_exam_score', 
                'parent_edu', 'study_hours', 'internet_access', 'sleep_hours', 
                'extra_curricular', 'attendance', 'assignment_score', 
                'mid_sem_marks', 'lab_performance', 'backlogs', 'final_grade', 'pass_fail']
data[numeric_cols] = data[numeric_cols].apply(pd.to_numeric, errors='coerce')

# Check for missing values in important columns.
print("Missing values for first-semester critical columns:")
print(data.loc[data['semester'] == 1, ['high_school_marks', 'entrance_exam_score']].isnull().sum())

print("Missing values for higher-semester critical columns:")
print(data.loc[data['semester'] > 1, ['prev_sem_grade']].isnull().sum())

# For higher-semester data, if prev_sem_grade is missing, fill with the column mean.
if data.loc[data['semester'] > 1, 'prev_sem_grade'].isnull().sum() > 0:
    data['prev_sem_grade'].fillna(data['prev_sem_grade'].mean(), inplace=True)

# --- Define Feature Lists ---
# For first-semester predictions, we use these features.
first_sem_features = [
    'high_school_marks', 'entrance_exam_score', 'parent_edu',
    'study_hours', 'internet_access', 'sleep_hours', 'extra_curricular',
    'attendance', 'assignment_score', 'mid_sem_marks',
    'lab_performance', 'backlogs'
]
# For higher-semester predictions, we include prev_sem_grade as well.
higher_sem_features = first_sem_features + ['prev_sem_grade']

# --- Train Models for First-Semester (semester == 1) ---
first_sem_data = data[data['semester'] == 1]
if not first_sem_data.empty:
    X_first = first_sem_data[first_sem_features]
    y_first_grade = first_sem_data['final_grade']
    
    X_train, X_test, y_train, y_test = train_test_split(X_first, y_first_grade, test_size=0.2, random_state=42)
    model_first_grade = RandomForestRegressor(n_estimators=100, random_state=42)
    model_first_grade.fit(X_train, y_train)
    mae_first = mean_absolute_error(y_test, model_first_grade.predict(X_test))
    print("First Semester Grade MAE:", mae_first)
    
    y_first_pass = first_sem_data['pass_fail']
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_first, y_first_pass, test_size=0.2, random_state=42)
    model_first_pass = RandomForestClassifier(n_estimators=100, random_state=42)
    model_first_pass.fit(X_train_p, y_train_p)
    acc_first = accuracy_score(y_test_p, model_first_pass.predict(X_test_p))
    print("First Semester Pass/Fail Accuracy:", acc_first)
else:
    model_first_grade = None
    model_first_pass = None

# --- Train Models for Higher Semesters (semester > 1) ---
higher_sem_data = data[data['semester'] > 1]
if not higher_sem_data.empty:
    X_higher = higher_sem_data[higher_sem_features]
    y_higher_grade = higher_sem_data['final_grade']
    
    X_train, X_test, y_train, y_test = train_test_split(X_higher, y_higher_grade, test_size=0.2, random_state=42)
    model_higher_grade = RandomForestRegressor(n_estimators=100, random_state=42)
    model_higher_grade.fit(X_train, y_train)
    mae_higher = mean_absolute_error(y_test, model_higher_grade.predict(X_test))
    print("Higher Semester Grade MAE:", mae_higher)
    
    y_higher_pass = higher_sem_data['pass_fail']
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_higher, y_higher_pass, test_size=0.2, random_state=42)
    model_higher_pass = RandomForestClassifier(n_estimators=100, random_state=42)
    model_higher_pass.fit(X_train_p, y_train_p)
    acc_higher = accuracy_score(y_test_p, model_higher_pass.predict(X_test_p))
    print("Higher Semester Pass/Fail Accuracy:", acc_higher)
else:
    model_higher_grade = None
    model_higher_pass = None

# --- Train KMeans for Clustering ---
# Use the actual final_grade from all data to cluster students.
grades = data['final_grade'].values.reshape(-1, 1)
kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(grades)

# --- Save Models and Metadata in a Dictionary ---
models_dict = {
    'first_sem_features': first_sem_features,
    'higher_sem_features': higher_sem_features,
    'model_first_grade': model_first_grade,
    'model_first_pass': model_first_pass,
    'model_higher_grade': model_higher_grade,
    'model_higher_pass': model_higher_pass,
    'kmeans': kmeans
}

# Save the dictionary as a pickle file.
with open('balanced_student_model.pkl', 'wb') as f:
    pickle.dump(models_dict, f)

print("Training complete and saved to 'student_model.pkl'")
