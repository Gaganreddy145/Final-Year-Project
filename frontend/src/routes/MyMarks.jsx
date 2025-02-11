import React, { useContext, useEffect } from "react";
import { getToken } from "../utils/tokenHandler";
import { json, Link, redirect, useLoaderData } from "react-router-dom";
import { StudentContext } from "../student/StudentContext";

function MyMarks() {
  const {
    data: { doc: student },
  } = useLoaderData();

  const { handleSetData, studentData } = useContext(StudentContext);

  useEffect(() => {
    handleSetData(student);
  }, [student]);

  // console.log(studentData);

  const years = [];
  for (let i = 1; i <= studentData.year; i++) years.push(i);

  return (
    <div>
      <h1>MyMarks</h1>
      <p>{studentData.name}</p>
      <ul>
        {years.map((num) => {
          return (
            <li key={num}>
              <Link to={`/marks/${num}`}>Year {num}</Link>
            </li>
          );
        })}
      </ul>
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
