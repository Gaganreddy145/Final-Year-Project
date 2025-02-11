import React, { useState, useEffect } from "react";
import { getToken } from "../utils/tokenHandler";
import getRole from "../utils/decodeRole";
import { redirect, useLoaderData, Link } from "react-router-dom";
import "./TeacherDetails.css";
import defaultTeacherPhoto from "./../../../professor.png"; // Adjust the path as needed


function TeacherDetails() {
  // Load initial teacher data from the loader
  const loadedData = useLoaderData();
  const [teachers, setTeachers] = useState(
    loadedData && loadedData.data && loadedData.data.teachers
      ? loadedData.data.teachers
      : []
  );

  // Search input and alert message state
  const [searchValue, setSearchValue] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  // Determine user role (if needed for future use)
  const role = getRole();

  // Search function: find teacher by employeeId and update the teacher list
  const handleSearch = () => {
    const foundTeacher = teachers.find(
      (teacher) => teacher.employeeId === searchValue.trim()
    );
    if (!foundTeacher) {
      setAlertMsg("No teacher found");
    } else {
      setAlertMsg("");
      setTeachers([foundTeacher]);
    }
    setSearchValue("");
  };

  return (
    <div className="teacher-main-content">
      <h1 className="teacher-page-title">Teacher Details</h1>
      <div className="teacher-search-container">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setAlertMsg("");
          }}
          placeholder="Enter employee ID..."
          className="teacher-search-input"
        />
        <button onClick={handleSearch} className="teacher-search-button">
          Search
        </button>
      </div>
      {alertMsg && <p className="teacher-alert-msg">{alertMsg}</p>}
      <div className="teacher-card-grid">
        {teachers.map((teacher) => {
          // Destructure teacher fields; adjust names as per your schema
          const { _id, teacherPhotoUrl, name, designation, experience } =
            teacher;
          return (
            <div key={_id} className="teacher-card">
              <img
                src={teacherPhotoUrl || defaultTeacherPhoto}
                alt={name}
                className="teacher-card-photo"
              />
              <div className="teacher-card-content">
                <h2 className="teacher-card-name">{name}</h2>
                <p className="teacher-card-info">Employee ID: {_id}</p>
                <p className="teacher-card-info">Experience: {experience}</p>
                <p className="teacher-card-info">Designation: {designation}</p>
              </div>
              <Link
                to={`/teacher-details/${_id}`}
                className="teacher-card-link"
              >
                View Details
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const loader = async () => {
  const token = getToken();
  if (!token) return redirect("/login");
  const role = getRole();
  if (role !== "admin") return redirect("/");
  const response = await fetch("http://localhost:3000/api/users/admin/all-teachers", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Response(JSON.stringify({ message: response.statusText }), {
      status: response.status,
    });
  }

  const result = await response.json();
  return result;
};

export default TeacherDetails;
