import React, { useState, useEffect } from "react";
import { getToken } from "../utils/tokenHandler";
import { redirect, useLoaderData, Link } from "react-router-dom";
import "./StuDetails.css";
import photos from "./../../../custom image.png";
import getRole from "../utils/decodeRole";

function StuDetails() {
  // Load initial data from the loader (if any)
  const loadedData = useLoaderData();
  const [students, setStudents] = useState(
    loadedData && loadedData.data && loadedData.data.students
      ? loadedData.data.students
      : []
  );

  // For filtering students by year and section
  const [filters, setFilters] = useState({
    year: "",
    section: "",
  });

  // For search input and messages
  const [change, setChange] = useState("");
  const [message, setMessage] = useState("");

  // To keep track of selected student IDs
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Check if all students are selected
  const allSelected =
    students.length > 0 && selectedStudents.length === students.length;

  const role = getRole();
  const [isLoading, setIsLoading] = useState(false);

  // Whenever filters change, fetch the filtered student data
  useEffect(() => {
    const fetchStudents = async () => {
      const token = getToken();
      if (!token) {
        return redirect("/login");
      }

      // Build query parameters from filters (only include if a value is set)
      const queryParams = new URLSearchParams();
      if (filters.year) queryParams.append("year", filters.year);
      if (filters.section) queryParams.append("section", filters.section);
      let query = queryParams.toString();
      let url = `http://localhost:3000/api/students/`;
      if (query) {
        url += `?${query}`;
      }

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          // Assume your API responds with an object containing data.students
          setStudents(result.data.students);
          // Reset selections whenever new data is loaded
          setSelectedStudents([]);
        } else {
          console.error("Failed to fetch students:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [filters]);

  // Update filters state when dropdown values change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleSearch = (searchValue) => {
    const student = students.find((student) => student.rollno == searchValue);
    if (!student) {
      setMessage("No student found");
      return;
    }
    const arrStudent = [student];
    setStudents(arrStudent);
    setChange("");
    // Reset selection if only one student remains.
    setSelectedStudents([]);
  };

  // Toggle selection of an individual student
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Toggle selection for all students
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedStudents([]);
    } else {
      const allIds = students.map((student) => student._id);
      setSelectedStudents(allIds);
    }
  };

  // Handle the promote action: send a request to the backend with selected student IDs
  const handlePromote = async () => {
    if (selectedStudents.length === 0) {
      setMessage("No students selected for promotion.");
      return;
    }

    const token = getToken();
    if (!token) {
      return redirect("/login");
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/students/promote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentIds: selectedStudents }),
        }
      );
      if (response.ok) {
        setMessage("Students promoted successfully!");
        // Optionally, refresh or update the student list here after promotion.
      } else {
        setMessage("Promotion failed. Please try again.");
        console.error("Promotion failed:", response.statusText);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error promoting students:", error);
      setMessage("An error occurred during promotion.");
    }
  };

  return (
    <div>
      {/* Navigation Bar */}
      {role === "admin" && (
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/add-students" className="navbar-link">
              Add Students
            </Link>
            <Link to="/add-user" className="navbar-link">
              Add Teachers
            </Link>
            <Link to="/add-semgrade" className="navbar-link">
              Add Sem Grade
            </Link>
          </div>
        </nav>
      )}
      {role === "teacher" && (
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/add-marks" className="navbar-link">
              Add Marks
            </Link>
            {/* <Link to="/add-user" className="navbar-link">
            Add Teachers
          </Link> */}
            <Link className="navbar-link" to="/add-attendance">
              Add Attendance
            </Link>
          </div>
        </nav>
      )}

      {/* Main container with sidebar and content */}
      <div className="main-container">
        {/* Sidebar for filters */}
        <div className="sidebar">
          <h2>Filters</h2>
          <div className="filter-group">
            <label htmlFor="year">Year:</label>
            <select
              name="year"
              id="year"
              value={filters.year}
              onChange={handleFilterChange}
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="section">Section:</label>
            <select
              name="section"
              id="section"
              value={filters.section}
              onChange={handleFilterChange}
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>

        {/* Content area for student cards */}
        <div className="content">
          <h1 className="title">Student Details</h1>
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              onChange={(e) => {
                setMessage("");
                setChange(e.target.value);
              }}
              value={change}
              placeholder="Enter roll number..."
              style={{
                padding: "8px",
                width: "200px",
                marginRight: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={() => handleSearch(change)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Search
            </button>
            {/* Select All Checkbox */}
            {role === "admin" && filters.section === "" && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  style={{ marginRight: "5px" }}
                />
                Select All
              </label>
            )}
            {/* Promote Button */}
            {role === "admin" && (
              <button
                onClick={handlePromote}
                disabled={isLoading}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "green",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {isLoading ? "Promoting..." : "Promote"}
              </button>
            )}
          </div>
          {message && <p>{message}</p>}
          <div className="grid">
            {students.map((student) => {
              // Destructure student properties; adjust property names as per your data
              const { _id, photo, name, rollno, year, section } = student;
              // Check if this student is selected
              const isSelected = selectedStudents.includes(_id);
              return (
                <div key={_id} className="card">
                  {/* Checkbox placed inside the card */}
                  <div style={{ padding: "8px" }}>
                    {role === "admin" && (
                      <label style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStudentSelection(_id)}
                          style={{ marginRight: "5px" }}
                        />
                        Select
                      </label>
                    )}
                  </div>
                  <img src={photos} alt={name} className="card-photo" />
                  <div className="card-content">
                    <h2 className="card-title">{name}</h2>
                    <p className="card-text">Roll No: {rollno}</p>
                    <p className="card-text">Year: {year}</p>
                    <p className="card-text">Section: {section}</p>
                  </div>
                  <Link className="card-button" to={`/student-details/${_id}`}>
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const loader = async () => {
  const token = getToken();
  if (!token) return redirect("/login");

  const response = await fetch("http://localhost:3000/api/students/", {
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

export default StuDetails;
