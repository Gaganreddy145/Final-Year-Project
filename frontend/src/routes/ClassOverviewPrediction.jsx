import React from "react";
import { Form, json, redirect, useActionData } from "react-router-dom";
import { getToken } from "../utils/tokenHandler";
import { Pie } from "react-chartjs-2";
import styles from "./ClassOverviewPrediction.module.css";

// Import and register Chart.js components
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

function ClassOverviewPrediction() {
  const predictedData = useActionData();

  // Prepare chart data if summary exists
  let chartData = null;
  if (
    predictedData &&
    predictedData.data &&
    predictedData.data.summary &&
    Object.keys(predictedData.data.summary).length > 0
  ) {
    const summary = predictedData.data.summary;
    const labels = Object.keys(summary);
    const dataCounts = labels.map((label) => summary[label].count);

    // Define color mapping for each category
    const colorMapping = {
      Good: { background: "#4caf50", hover: "#66bb6a" },
      Medium: { background: "#ff9800", hover: "#ffb74d" },
      Low: { background: "#f44336", hover: "#e57373" },
    };

    const backgroundColors = labels.map((label) =>
      colorMapping[label] ? colorMapping[label].background : "#9e9e9e"
    );
    const hoverColors = labels.map((label) =>
      colorMapping[label] ? colorMapping[label].hover : "#bdbdbd"
    );

    chartData = {
      labels: labels,
      datasets: [
        {
          data: dataCounts,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: hoverColors,
        },
      ],
    };
  }

  return (
    <div className={styles.classOverviewContainer}>
      <h1 className={styles.classOverviewTitle}>Class Overview Prediction</h1>
      <Form method="POST" className={styles.predictionForm}>
        <div className={styles.formGroup}>
          <label htmlFor="year">Year:</label>
          <select name="year" id="year" required>
            <option value="">Select</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="section">Section:</label>
          <select name="section" id="section" required>
            <option value="">Select</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <input type="submit" value="Predict" />
        </div>
      </Form>

      {/* Display the pie chart only if prediction data exists */}
      {chartData && (
        <div className={styles.chartContainer}>
          <h2>Performance Summary</h2>
          <Pie
            data={chartData}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                },
              },
            }}
          />
        </div>
      )}

      {/* Display the prediction results in a beautifully styled table */}
      {predictedData &&
        predictedData.data &&
        predictedData.data.results && (
          <div className={styles.tableContainer}>
            <h2>Prediction Results</h2>
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Pass/Fail</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {predictedData.data.results.map((res) => {
                  const { rollno, performance_category, predicted_pass_fail } =
                    res;
                  return (
                    <tr key={rollno}>
                      <td>{rollno}</td>
                      <td>{predicted_pass_fail}</td>
                      <td>{performance_category}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

export const action = async ({ request }) => {
  const data = await request.formData();
  const submittedData = {
    year: Number(data.get("year")),
    section: data.get("section"),
  };

  const token = getToken();
  if (!token) return redirect("/login");

  const response = await fetch(
    "http://localhost:3000/api/students/teacher-predict",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(submittedData),
    }
  );

  if (!response.ok) {
    const result = await response.json();
    throw json(
      { message: result.message || "Something went wrong!!!" },
      { status: response.status }
    );
  }
  const result = await response.json();
  return result;
};

export default ClassOverviewPrediction;
