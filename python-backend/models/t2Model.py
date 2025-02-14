import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import mean_absolute_error, accuracy_score
from imblearn.over_sampling import SMOTE

# --- Load Training Data from CSV ---
data = pd.read_csv("student2_teacher_data_5000.csv")

# --- Data Preprocessing ---
# Ensure that key columns are numeric.
# For our reduced model, we use:
# - For semester 1: 'high_school_marks', 'entrance_exam_score', 'attendance'
# - For semester 2: add 'prev_sem_grade'
numeric_cols = ['prev_sem_grade', 'high_school_marks', 'entrance_exam_score', 
                'attendance', 'final_grade', 'pass_fail', 'semester']
data[numeric_cols] = data[numeric_cols].apply(pd.to_numeric, errors='coerce')

# For higher-semester data, if prev_sem_grade is missing, fill with the column mean.
if data.loc[data['semester'] > 1, 'prev_sem_grade'].isnull().sum() > 0:
    data.loc[data['semester'] > 1, 'prev_sem_grade'].fillna(data['prev_sem_grade'].mean(), inplace=True)

# --- Define Feature Lists ---
# For first-semester candidates (no previous semester grade)
first_sem_features = ['high_school_marks', 'entrance_exam_score', 'attendance']
# For higher-semester candidates (includes prev_sem_grade)
higher_sem_features = ['prev_sem_grade', 'high_school_marks', 'entrance_exam_score', 'attendance']

# --- Train Models for First Semester (semester == 1) ---
first_sem_data = data[data['semester'] == 1]
if not first_sem_data.empty:
    # Regression model for final grade
    X_first = first_sem_data[first_sem_features]
    y_first_grade = first_sem_data['final_grade']
    X_train, X_test, y_train, y_test = train_test_split(X_first, y_first_grade, test_size=0.2, random_state=42)
    model_first_grade = RandomForestRegressor(n_estimators=100, random_state=42)
    model_first_grade.fit(X_train, y_train)
    mae_first = mean_absolute_error(y_test, model_first_grade.predict(X_test))
    print("First Semester Grade MAE:", mae_first)
    
    # Classification model for pass/fail using SMOTE
    y_first_pass = first_sem_data['pass_fail']
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_first, y_first_pass, test_size=0.2, random_state=42, stratify=y_first_pass)
    sm = SMOTE(random_state=42)
    X_train_p_res, y_train_p_res = sm.fit_resample(X_train_p, y_train_p)
    model_first_pass = RandomForestClassifier(n_estimators=100, random_state=42)
    model_first_pass.fit(X_train_p_res, y_train_p_res)
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
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_higher, y_higher_pass, test_size=0.2, random_state=42, stratify=y_higher_pass)
    sm = SMOTE(random_state=42)
    X_train_p_res, y_train_p_res = sm.fit_resample(X_train_p, y_train_p)
    model_higher_pass = RandomForestClassifier(n_estimators=100, random_state=42)
    model_higher_pass.fit(X_train_p_res, y_train_p_res)
    acc_higher = accuracy_score(y_test_p, model_higher_pass.predict(X_test_p))
    print("Higher Semester Pass/Fail Accuracy:", acc_higher)
else:
    model_higher_grade = None
    model_higher_pass = None

# --- Train KMeans for Clustering ---
# Use the actual final_grade from all data to cluster students into three performance categories.
grades = data['final_grade'].values.reshape(-1, 1)
kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(grades)

# --- Save Models and Metadata in a Dictionary ---
models_dict = {
    'first_sem_features2': first_sem_features,
    'higher_sem_features2': higher_sem_features,
    'model_first_grade2': model_first_grade,
    'model_first_pass2': model_first_pass,
    'model_higher_grade2': model_higher_grade,
    'model_higher_pass2': model_higher_pass,
    'kmeans2': kmeans
}

with open('reduced3_feature_student_model.pkl', 'wb') as f:
    pickle.dump(models_dict, f)

print("Training complete and saved to 'reduced_feature_student_model.pkl'")
