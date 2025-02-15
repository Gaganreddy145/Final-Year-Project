import React, { useContext, useEffect } from "react";
import { getToken } from "../utils/tokenHandler";
import { json, Link, redirect, useLoaderData } from "react-router-dom";
import { StudentContext } from "../student/StudentContext";
import styles from "./MyMarks.module.css";

function MyMarks() {
  const {
    data: { doc: student },
  } = useLoaderData();

  const { handleSetData, studentData } = useContext(StudentContext);

  useEffect(() => {
    handleSetData(student);
  }, [student]);

  const years = [];
  for (let i = 1; i <= studentData.year; i++) years.push(i);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>My Marks</h1>
      <p className={styles.studentName}>{studentData.name}</p>
      <div className={styles.cardsContainer}>
        {years.map((num) => (
          <Link to={`/marks/${num}`} key={num} className={styles.card}>
            <span className={styles.cardText}>Year {num}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const loader = async () => {
  const token = getToken();
  if (!token) return redirect("/login");
  const response = await fetch("http://localhost:3000/api/students/find/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const result = await response.json();
    throw json({ message: result.message }, { status: response.status });
  }

  const result = await response.json();
  return result;
};

export default MyMarks;
