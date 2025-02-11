import React, { useState } from "react";
import "./StudentMarksTable.css";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/tokenHandler";

const StudentMarksTable = () => {
  const [columns, setColumns] = useState(["Roll No"]);
  const [rows, setRows] = useState([{ rollno: "" }]);
  const [examNumber, setExamNumber] = useState("");
  const navigate = useNavigate();

  const addColumn = () => {
    const newColumn = prompt("Enter Subject Name:");
    if (newColumn) setColumns([...columns, newColumn]);
  };

  const addRow = () => {
    setRows([...rows, { rollno: "" }]);
  };

  const handleInputChange = (rowIndex, colName, value) => {
    const updatedRows = [...rows];
    if (colName === "Roll No") {
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], rollno: value };
    } else {
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], [colName]: value };
    }
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, rowIndex) => rowIndex !== index);
    setRows(updatedRows);
  };

  const handleSubmit = async () => {
    const formattedData = [];
    rows.forEach((row) => {
      columns.slice(1).forEach((subject) => {
        if (row[subject] !== undefined) {
          formattedData.push({
            rollno: Number(row.rollno),
            sname: subject.toLowerCase(),
            marks: Number(row[subject]),
            mno: Number(examNumber),
          });
        }
      });
    });

    if (formattedData.length === 0) {
      alert("No data");
      return;
    }

    const token = getToken();
    if (!token) return navigate("/login");

    try {
      const response = await fetch("http://localhost:3000/api/marks/midMarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ midMarks: formattedData }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Something went wrong!!!");
      }

      alert("Successfully submitted");
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Student Marks Entry</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <table className="marks-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="number"
                      value={col === "Roll No" ? row.rollno : row[col] || ""}
                      onChange={(e) =>
                        handleInputChange(rowIndex, col, e.target.value)
                      }
                      required
                    />
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(rowIndex)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="buttons">
          <button type="button" onClick={addRow} className="btn add-row">
            Add Row
          </button>
          <button type="button" onClick={addColumn} className="btn add-column">
            Add Column
          </button>
        </div>
        <div className="exam-number">
          <label>Exam Number:</label>
          <input
            type="number"
            value={examNumber}
            onChange={(e) => setExamNumber(e.target.value)}
            max={2}
            min={1}
            required
          />
        </div>
        <button type="submit" className="btn submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default StudentMarksTable;
