import React from "react";
import { Form, redirect, useActionData, Link, useSearchParams } from "react-router-dom";
import { getToken } from "../utils/tokenHandler";
import "./Login.css";

function Login() {
  const data = useActionData();
  const [searchParams] = useSearchParams({ mode: "adteach" });
  const isStudent = searchParams.get("mode") !== "adteach";

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        {data && data.message && <p className="error-message">{data.message}</p>}
        <Form method="POST" className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" name="email" id="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" name="password" id="password" required />
          </div>
          <div>
            <Link
              to={`?mode=${isStudent ? "adteach" : "student"}`}
              style={{
                float: "right",
                marginTop: "10px",
                marginBottom:"10px",
                textDecoration: "none",
                color: "#007BFF",
              }}
            >
              {isStudent ? "Admin/Teacher" : "Student"} Login
            </Link>
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </Form>
      </div>
    </div>
  );
}

export const action = async ({ request }) => {
  const data = await request.formData();
  const loginData = {
    email: data.get("email"),
    password: data.get("password"),
  };

  const urlParams = new URL(request.url).searchParams;
  const isStudent = urlParams.get("mode") !== "adteach";

  const loginUrl = isStudent
    ? "http://localhost:3000/api/students/login"
    : "http://localhost:3000/api/users/login";

  const response = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const result = await response.json();
  if (result.status === "success") {
    localStorage.setItem("token-student", JSON.stringify(result.token));
    return redirect("/");
  } else {
    return result;
  }
};

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  if (!url.searchParams.get("mode")) {
    return redirect(`${url.pathname}?mode=adteach`);
  }
  const token = getToken();
  if (token) return redirect("/");
  return null;
};

export default Login;
