import React from "react";
// import { getToken } from "../utils/tokenHandler";
import { Form, useRouteLoaderData, Link } from "react-router-dom";
function StudentDashBoard() {
  const token = useRouteLoaderData("root");
  return (
    <div>
      StudentDashBoard
      <Link to={"/marks"}>Marks</Link>
      <Link to={"/predict"}>Prediction</Link>
      {token && (
        <Form method="post" action="/logout">
          <button type="submit">Logout</button>
        </Form>
      )}
    </div>
  );
}

export default StudentDashBoard;
