import React, { useState } from "react";
import { getToken } from "../utils/tokenHandler";
import { redirect } from "react-router-dom";

const initialStudent = {
  rollno: 0,
  grade: 0,
};

function AddSemGrades() {
  const [students, setStudents] = useState([initialStudent]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update the value for a given student row and field
  const handleChange = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  // Add a new student row
  const addRow = () => {
    setStudents([
      ...students,
      {
        ...initialStudent,
        rollno: 0,
        grade: 0,
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
    setIsLoading(true);
    const semgrades = students.map((sem) => {
      const { rollno, grade } = sem;
      return {
        rollno: rollno * 1,
        sem: grade * 1,
      };
    });
    // console.log(semgrades);

    const token = getToken();

    try {
      const response = await fetch(
        "http://localhost:3000/api/students/semgrade",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ grades: semgrades }),
        }
      );

      if (response.ok) {
        setMessage("Grades added successfully!");
        setStudents([initialStudent]); // Reset form
      } else {
        const error = await response.json();
        setMessage("Error: " + (error.message || "Failed to add grades."));
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error submitting grades:", error);
      setMessage("An error occurred while adding grades.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Add Semester Grades</h1>
      <form onSubmit={handleSubmit}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Roll No</th>
              <th style={styles.th}>Grade</th>
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
                    type="number"
                    value={student.grade}
                    onChange={(e) =>
                      handleChange(index, "grade", e.target.value)
                    }
                    min={0}
                    max={10}
                    step="0.01"
                    style={styles.input}
                    required
                  />
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
          <button type="submit" style={styles.submitButton}>
            {isLoading ? "Submitting..." : " Submit All Grades"}
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

export default AddSemGrades;
