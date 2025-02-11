import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { StudentContext } from "../student/StudentContext";
import "./MyMidMarksSpecificYear.css"; // Import the CSS

function MyMidMarksSpecificYear() {
  const { handleFilterMidMarks, midMarks, studentData } =
    useContext(StudentContext);
  const { year } = useParams();

  useEffect(() => {
    if (studentData && Object.keys(studentData).length > 0) {
      handleFilterMidMarks(year);
    }
  }, [year, studentData]);

  const transformMarks = (semMarks) => {
    const subjectMap = {};
    semMarks.forEach((markObj) => {
      const subject = markObj.sname;
      if (!subjectMap[subject]) {
        subjectMap[subject] = { subject, mid1: null, mid2: null };
      }
      if (markObj.mno === 1) {
        subjectMap[subject].mid1 = markObj.marks;
      } else if (markObj.mno === 2) {
        subjectMap[subject].mid2 = markObj.marks;
      }
    });
    return Object.values(subjectMap);
  };

  const sem1Data = midMarks.sem1 ? transformMarks(midMarks.sem1) : [];
  const sem2Data = midMarks.sem2 ? transformMarks(midMarks.sem2) : [];

  return (
    <div className="my-mid-marks-specific-year">
      <h2 className="title">Mid Exam Marks for Year {year}</h2>

      <div className="table-container">
        <h3 className="semester-title">Semester 1</h3>
        {sem1Data.length > 0 ? (
          <table className="marks-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Mid 1</th>
                <th>Mid 2</th>
              </tr>
            </thead>
            <tbody>
              {sem1Data.map((row) => (
                <tr key={row.subject}>
                  <td>{row.subject}</td>
                  <td>{row.mid1 !== null ? row.mid1 : "—"}</td>
                  <td>{row.mid2 !== null ? row.mid2 : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Marks are unavailable</p>
        )}
      </div>

      <div className="table-container">
        <h3 className="semester-title">Semester 2</h3>
        {sem2Data.length > 0 ? (
          <table className="marks-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Mid 1</th>
                <th>Mid 2</th>
              </tr>
            </thead>
            <tbody>
              {sem2Data.map((row) => (
                <tr key={row.subject}>
                  <td>{row.subject}</td>
                  <td>{row.mid1 !== null ? row.mid1 : "—"}</td>
                  <td>{row.mid2 !== null ? row.mid2 : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Marks are unavailable</p>
        )}
      </div>
    </div>
  );
}

export default MyMidMarksSpecificYear;

/* MyMidMarksSpecificYear.css */
