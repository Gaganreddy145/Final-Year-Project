import React from "react";
import { Form, json, redirect, useActionData } from "react-router-dom";
import "./StudentPrediction.css";
import { getToken } from "../utils/tokenHandler";

function StudentPrediction() {
  const data = useActionData();

  return (
    <div className="student-prediction-container">
      <h1>Student Performance Prediction</h1>

      {data && data.data && data.data.result && (
        <div className="result-container">
          <h3>Score: {data.data.result.predicted_final_grade}</h3>
          <h4>Pass/Fail: {data.data.result.predicted_pass_fail}</h4>
        </div>
      )}

      <Form method="POST" className="prediction-form">
        <div className="form-group">
          <label htmlFor="high_school_marks">High School Marks:</label>
          <input
            type="number"
            id="high_school_marks"
            name="high_school_marks"
            min={35}
            max={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="entrance_exam_score">Entrance Exam Score:</label>
          <input
            type="number"
            id="entrance_exam_score"
            name="entrance_exam_score"
            min={35}
            max={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="parent_edu">Parent Education:</label>
          <select id="parent_edu" name="parent_edu" required>
            <option value="">Select</option>
            <option value="0">High School</option>
            <option value="1">Graduate</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="study_hours">Study Hours:</label>
          <input
            type="number"
            id="study_hours"
            name="study_hours"
            min={0}
            max={15}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="internet_access">Internet Access:</label>
          <select id="internet_access" name="internet_access" required>
            <option value="">Select</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="sleep_hours">Sleep Hours:</label>
          <input
            type="number"
            id="sleep_hours"
            name="sleep_hours"
            min={3}
            max={18}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="extra_curricular">Extra Curricular:</label>
          <select id="extra_curricular" name="extra_curricular" required>
            <option value="">Select</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="assignment_score">Assignment Score:</label>
          <input
            type="number"
            id="assignment_score"
            name="assignment_score"
            min={0}
            max={10}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="mid_sem_marks">Mid-Semester Marks:</label>
          <input
            type="number"
            id="mid_sem_marks"
            name="mid_sem_marks"
            min={0}
            max={30}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lab_performance">Lab Performance:</label>
          <input
            type="number"
            id="lab_performance"
            name="lab_performance"
            min={0}
            max={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="backlogs">Backlogs:</label>
          <input
            type="number"
            id="backlogs"
            name="backlogs"
            min={0}
            max={15}
            required
          />
        </div>

        <div className="form-group">
          <input type="submit" value="Predict" className="submit-btn" />
        </div>
      </Form>
    </div>
  );
}

export const action = async ({ request }) => {
  const data = await request.formData();
  const submittedData = {
    backlogs: +data.get("backlogs"),
    lab_performance: +data.get("lab_performance"),
    mid_sem_marks: +data.get("mid_sem_marks"),
    assignment_score: +data.get("assignment_score"),
    extra_curricular: +data.get("extra_curricular"),
    sleep_hours: +data.get("sleep_hours"),
    internet_access: +data.get("internet_access"),
    study_hours: +data.get("study_hours"),
    parent_edu: +data.get("parent_edu"),
    entrance_exam_score: +data.get("entrance_exam_score"),
    high_school_marks: +data.get("high_school_marks"),
  };

  const token = getToken();
  if (!token) return redirect("/login");

  const response = await fetch("http://localhost:3000/api/students/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(submittedData),
  });

  if (!response.ok) {
    const result = await response.json();
    throw json(
      { message: result.message || "Something went wrong" },
      { status: response.status }
    );
  }

  const result = await response.json();
  return result;
};

export default StudentPrediction;
