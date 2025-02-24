import React, { useState } from "react";
import { getToken } from "../utils/tokenHandler";
import { redirect } from "react-router-dom";

const initialStudent = {
  rollno: 0,
  name: "",
  password: "",
  phno: "",
  email: "",
  section: "A",
};

function AddStudentsExcel() {
  const [students, setStudents] = useState([initialStudent]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading,setIsLoading] = useState(false);

  // Update the value for a given student row and field
  const handleChange = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);

    // Validate phone number
    if (field === "phno") {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [index]: "Invalid Indian phone number",
        }));
      } else {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[index]; // Remove error if valid
          return newErrors;
        });
      }
    }
  };

  // Add a new student row
  const addRow = () => {
    setStudents([
      ...students,
      {
        ...initialStudent,
        rollno: 0,
        name: "",
        password: "",
        phno: "",
        email: "",
        section: "A",
      },
    ]);
  };

  // Delete a student row
  const deleteRow = (index) => {
    const newStudents = students.filter((_, i) => i !== index);
    setStudents(newStudents);
  };

  // Submit all student rows to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(students);
    const token = getToken();

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3000/api/students/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ students }),
      });

      if (response.ok) {
        setMessage("Students added successfully!");
        setStudents([initialStudent]); // Reset form
      } else {
        const error = await response.json();
        setMessage("Error: " + (error.message || "Failed to add students."));
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error submitting students:", error);
      setMessage("An error occurred while adding students.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Add Multiple Students</h1>
      <form onSubmit={handleSubmit}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Roll No</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Password</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Section</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index}>
                <td style={styles.td}>
                  <input
                    type="number"
                    value={student.rollno}
                    onChange={(e) =>
                      handleChange(index, "rollno", e.target.value)
                    }
                    style={styles.input}
                    min={0}
                    required
                  />
                </td>
                <td style={styles.td}>
                  <input
                    type="text"
                    value={student.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    style={styles.input}
                    required
                  />
                </td>
                <td style={styles.td}>
                  <input
                    type="password"
                    value={student.password}
                    onChange={(e) =>
                      handleChange(index, "password", e.target.value)
                    }
                    style={styles.input}
                    required
                  />
                </td>
                <td style={styles.td}>
                  <input
                    type="text"
                    value={student.phno}
                    onChange={(e) =>
                      handleChange(index, "phno", e.target.value)
                    }
                    style={styles.input}
                    required
                  />
                  {errors[index] && (
                    <p style={{ color: "red", fontSize: "12px" }}>
                      {errors[index]}
                    </p>
                  )}
                </td>

                <td style={styles.td}>
                  <input
                    type="email"
                    value={student.email}
                    onChange={(e) =>
                      handleChange(index, "email", e.target.value)
                    }
                    style={styles.input}
                    required
                  />
                </td>
                <td style={styles.td}>
                  <select
                    value={student.section}
                    onChange={(e) =>
                      handleChange(index, "section", e.target.value)
                    }
                    style={styles.input}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <button
                    type="button"
                    onClick={() => deleteRow(index)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={styles.buttonContainer}>
          <button type="button" onClick={addRow} style={styles.addButton}>
            Add Row
          </button>
          <button
            type="submit"
            style={styles.submitButton}
            disabled={Object.keys(errors).length > 0 || isLoading}
          >
            {isLoading ? "Submitting..." : "Submit All Students"}
          </button>
        </div>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "95%",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    border: "1px solid #ddd",
    padding: "10px",
    backgroundColor: "#f2f2f2",
    textAlign: "left",
    fontWeight: "bold",
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "6px",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  buttonContainer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
  },
  addButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  submitButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "green",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  deleteButton: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#dc3545",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  message: {
    marginTop: "20px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
};

export const loader = () => {
  const token = getToken();
  if (!token) return redirect("/login");
  return null;
};

export default AddStudentsExcel;
