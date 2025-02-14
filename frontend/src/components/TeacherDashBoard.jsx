import React from "react";
import { Link, Form, useRouteLoaderData } from "react-router-dom";
import getRole from "../utils/decodeRole";

function TeacherDashBoard() {
  const token = useRouteLoaderData("root");
  const role = getRole();

  return (
    <div>
      <Link to="/student-details">Students</Link>
      <Link to="/my-details">My Details</Link>
      {role === "teacher" && (
        <Link to="/teacher-predict">Predict Class Overview</Link>
      )}
      {role === "admin" && <Link to="/teacher-details">Teachers</Link>}
      {token && (
        <Form method="post" action="/logout">
          <button type="submit">Logout</button>
        </Form>
      )}
    </div>
  );
}

export default TeacherDashBoard;
