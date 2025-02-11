import React, { useEffect, useState } from "react";
import { getToken } from "../utils/tokenHandler";
import {
  json,
  redirect,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./Student.css";
import photo from "./../../../custom image.png";
import getRole from "../utils/decodeRole";

function Student() {
  // Destructure the student object from the loaded data
  const {
    data: { student },
  } = useLoaderData();

  const navigate = useNavigate();
  const { id } = useParams();

  // midCurrent holds arrays for mid exam 1 and mid exam 2 marks
  const [midCurrent, setMidCurrent] = useState({
    m1: [],
    m2: [],
  });

  // Process midmarks on load: split into m1 and m2 for current year
  useEffect(() => {
    if (student.midmarks && student.midmarks.length > 0) {
      const currentYearSemMidMarks = student.midmarks.filter(
        (mid) => mid.year === student.year && mid.semno === student.currentSem
      );
      // console.log(currentYearMidMarks);
      const firstMid = currentYearSemMidMarks.filter((mid) => mid.mno === 1);
      const secondMid = currentYearSemMidMarks.filter((mid) => mid.mno === 2);
      
      setMidCurrent({ m1: firstMid, m2: secondMid });
    }
  }, [student]);

  // Combine marks from first and second mid exams into one object keyed by subject name
  const combinedMarks = {};
  midCurrent.m1.forEach((item) => {
    combinedMarks[item.sname] = { m1: item.marks, m2: "-" };
  });
  midCurrent.m2.forEach((item) => {
    if (combinedMarks[item.sname]) {
      combinedMarks[item.sname].m2 = item.marks;
    } else {
      combinedMarks[item.sname] = { m1: "-", m2: item.marks };
    }
  });
  const tableData = Object.entries(combinedMarks); // [ [subject, { m1, m2 }], ... ]

  const handleDelete = async () => {
    const token = getToken();
    const role = getRole();

    if (role !== "admin") {
      alert("You don't have permission to do this operation");

      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/students/" + id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Unable to delete");
      alert("Deleted Successfully");
      navigate("/student-details");
    } catch (error) {
      alert(error.message);
      console.log(error.message);
    }
  };

  return (
    <div className="student-container">
      <div className="student-card">
        <div className="student-photo">
          {/* Use student's photo if available; otherwise, a placeholder */}
          <img src={student.photo || photo} alt={student.name} />
        </div>
        <div className="student-details">
          <h2>{student.name}</h2>
          <p>
            <strong>Roll No:</strong> {student.rollno}
          </p>
          <p>
            <strong>Year:</strong> {student.year}
          </p>
          <p>
            <strong>Current Sem:</strong> {student.currentSem}
          </p>
          <p>
            <strong>Section:</strong> {student.section}
          </p>
          <p>
            <strong>Phone:</strong> {student.phno}
          </p>
          <p>
            <strong>Email:</strong> {student.email}
          </p>
          <p>
            <strong>Status:</strong> {student.status}
          </p>

          <div className="student-grades">
            <h3>Semester Grades:</h3>
            <ul>
              {student.semgrade.map((grade, index) => (
                <li key={index}>
                  Semester {index + 1}: {grade}
                </li>
              ))}
            </ul>
          </div>

          <div className="student-attendance">
            <h3>Attendance:</h3>
            <ul>
              {student.attendance.map((att, index) => (
                <li key={index}>
                  Semester {index + 1}: {att}%
                </li>
              ))}
            </ul>
          </div>

          <div className="student-midmarks">
            <h3>Mid Exam Marks:</h3>
            {tableData.length > 0 ? (
              <table className="marks-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Mid 1</th>
                    <th>Mid 2</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(([subject, marks]) => (
                    <tr key={subject}>
                      <td>{subject}</td>
                      <td>{marks.m1}</td>
                      <td>{marks.m2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No mid exam marks available.</p>
            )}
          </div>
          {getRole() === "admin" && (
            <button onClick={handleDelete} style={{ backgroundColor: "red" }}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const loader = async ({ request, params }) => {
  const token = getToken();
  if (!token) return redirect("/login");

  const response = await fetch(
    "http://localhost:3000/api/students/" + params.id,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok)
    throw json({ message: response.statusText }, { status: response.status });

  const result = await response.json();
  return result;
};

export default Student;
