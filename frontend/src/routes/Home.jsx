import React from "react";
import getRole from "../utils/decodeRole";
import TeacherDashBoard from "../components/TeacherDashBoard";
import StudentDashBoard from "../components/StudentDashBoard";

function Home() {
  const role = getRole();

  if (role === "teacher" || role === "admin") return <TeacherDashBoard />;
  else if (role === "student") return <StudentDashBoard />;
  else return <div>No role</div>;
}

export default Home;
