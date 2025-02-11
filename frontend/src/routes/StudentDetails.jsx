import React from "react";
import { Link, Outlet } from "react-router-dom";
const data = [1, 2, 3, 4];
function StudentDetails() {
  return (
    <div>
      <ul>
        {data.map((year) => {
          return (
            <li key={year}>
              <Link to={`/student-details/${year}`}>{year}</Link>
            </li>
          );
        })}
      </ul>
      
    </div>
  );
}

export default StudentDetails;
