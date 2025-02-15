import React from "react";
import { Form, useRouteLoaderData, Link } from "react-router-dom";
import styles from "./StudentDashBoard.module.css";

function StudentDashBoard() {
  const token = useRouteLoaderData("root");

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Student Dashboard</h1>

      <div className={styles.dashboardContainer}>
        <nav className={styles.navContainer}>
          <Link to="/marks" className={styles.card}>
            Marks
          </Link>
          <Link to="/predict" className={styles.card}>
            Prediction
          </Link>
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

export default StudentDashBoard;
