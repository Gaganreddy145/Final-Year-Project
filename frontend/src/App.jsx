import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./routes/RootLayout";
import Home from "./routes/Home";
import Login from "./routes/Login";
import {
  action as loginAction,
  loader as checkLoginLoader,
} from "./routes/Login";
import StudentDetails from "./routes/StudentDetails";
import MyDetails, { loader as myDetailsLoader } from "./routes/MyDetails";
import YearDetails, { loader as sectionsLoader } from "./routes/YearDetails";
import Details from "./routes/Details";
import StuDetails, { loader as studentLoader } from "./routes/StuDetails";
import Student, { loader as specificStudent } from "./routes/Student";
import { logoutAction } from "./routes/logout";
import { getToken } from "./utils/tokenHandler";
import AddUserForm from "./routes/AddUserForm";
import AddStudentsForm from "./routes/AddStudents";
import TeacherDetails, {
  loader as teacherDetailsLoader,
} from "./routes/TeacherDetails";
import StudentMarksTable from "./routes/StudentMarksTable";
import TeacherProfile, {
  loader as teacherProfileLoader,
} from "./routes/TeacherProfile";
import AddSemGrades, {
  loader as addSemGradeLoader,
} from "./routes/AddSemGrades";
import AddAttendance, {
  loader as addAttendanceLoader,
} from "./routes/AddAttendance";
import MyMarks, { loader as myMarksLoader } from "./routes/MyMarks";
import { StudentContextProvider } from "./student/StudentContext";
import MyMidMarksSpecificYear from "./routes/MyMidMarksSpecificYear";
import StudentPrediction, {
  action as studentPredictionAction,
} from "./routes/StudentPrediction";
import ClassOverviewPrediction,{action as classPredictionAction} from "./routes/ClassOverviewPrediction";
import ErrorPage from "./components/ErrorPage";
import LaggingSubjects from "./routes/LaggingSubjects";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
      action: loginAction,
      loader: checkLoginLoader,
    },
    {
      path: "/",
      element: <RootLayout />,
      errorElement:<ErrorPage />,
      id: "root",
      loader: getToken,
      children: [
        { index: true, element: <Home /> },
        {
          path: "student-details",
          element: <StuDetails />,
          loader: studentLoader,
        },
        {
          path: "student-details/:id",
          element: <Student />,
          loader: specificStudent,
        },
        {
          path: "add-user",
          element: <AddUserForm />,
        },
        {
          path: "add-students",
          element: <AddStudentsForm />,
        },
        {
          path: "teacher-details",
          element: <TeacherDetails />,
          loader: teacherDetailsLoader,
        },
        {
          path: "teacher-details/:id",
          element: <TeacherProfile />,
          loader: teacherProfileLoader,
        },
        {
          path: "add-marks",
          element: <StudentMarksTable />,
        },
        {
          path: "add-semgrade",
          element: <AddSemGrades />,
          loader: addSemGradeLoader,
        },
        {
          path: "add-attendance",
          element: <AddAttendance />,
          loader: addAttendanceLoader,
        },
        {
          path: "/:details",
          element: <Details />,
        },
        { path: "my-details", element: <MyDetails />, loader: myDetailsLoader },
        {
          path: "marks",
          element: <MyMarks />,
          loader: myMarksLoader,
        },
        {
          path: "marks/:year",
          element: <MyMidMarksSpecificYear />,
        },
        {
          path: "predict",
          element: <StudentPrediction />,
          action: studentPredictionAction,
        },
        {
          path:"teacher-predict",
          element:<ClassOverviewPrediction />,
          action:classPredictionAction
        },
        {
          path:"lagging-subjects",
          element:<LaggingSubjects />
        },
        {
          path: "logout",
          action: logoutAction,
        },
      ],
    },
  ]);
  return (
    <StudentContextProvider>
      <RouterProvider router={router} />
    </StudentContextProvider>
  );
}

export default App;
