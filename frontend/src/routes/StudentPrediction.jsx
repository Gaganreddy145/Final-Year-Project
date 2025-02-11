import React from "react";
import { Form, json, redirect, useActionData } from "react-router-dom";
import "./StudentPrediction.css";
import { getToken } from "../utils/tokenHandler";

function StudentPrediction() {
  const data = useActionData();
  // console.log(data);
  return (
    <>
      {data && data.data && data.data.result && (
        <>
          <h3>Score: {data.data.result.predicted_final_grade}</h3>
          <h4>Pass/Fail: {data.data.result.predicted_pass_fail}</h4>
        </>
      )}
    </>
  );
}
export const action = async ({ request }) => {
  const data = await request.formData();
  const submittedData = {
    backlogs: data.get("backlogs") * 1,
    lab_performance: data.get("lab_performance") * 1,
    mid_sem_marks: data.get("mid_sem_marks") * 1,
    assignment_score: data.get("assignment_score") * 1,
    extra_curricular: data.get("extra_curricular") * 1,
    sleep_hours: data.get("sleep_hours") * 1,
    internet_access: data.get("internet_access") * 1,
    study_hours: data.get("study_hours") * 1,
    parent_edu: data.get("parent_edu") * 1,
    entrance_exam_score: data.get("entrance_exam_score") * 1,
    high_school_marks: data.get("high_school_marks") * 1,
  };

  //   console.log(submittedData);
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
