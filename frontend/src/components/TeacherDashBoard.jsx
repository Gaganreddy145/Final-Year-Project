import React from "react";
import { Link, Form, useRouteLoaderData } from "react-router-dom";
import getRole from "../utils/decodeRole";
import styles from "./TeacherDashBoard.module.css";

function TeacherDashBoard() {
  const token = useRouteLoaderData("root");
  const role = getRole();

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.dashboardContainer}>
        <nav className={styles.navContainer}>
          <Link to="/student-details" className={styles.card}>
            Students
          </Link>
          <Link to="/my-details" className={styles.card}>
            My Details
          </Link>
          {role === "teacher" && (
            <Link to="/teacher-predict" className={styles.card}>
              Predict Class Overview
            </Link>
          )}
          {role === "admin" && (
            <Link to="/teacher-details" className={styles.card}>
              Teachers
            </Link>
          )}
        </nav>

        {token && (
          <Form method="post" action="/logout" className={styles.logoutForm}>
            <button type="submit" className={styles.logoutButton}>
              Logout
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}

export default TeacherDashBoard;
