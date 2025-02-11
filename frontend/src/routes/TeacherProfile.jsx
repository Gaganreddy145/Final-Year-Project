import React from "react";
import getRole from "../utils/decodeRole";
import {
  json,
  redirect,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import { getToken } from "../utils/tokenHandler";
import professor from "./../../../professor.png";
import "./MyDetails.css";
import { useState } from "react";

function TeacherProfile() {
  // Destructure the user object from the loaded data
  const {
    data: { user },
  } = useLoaderData();

  const [userSt, setUserSt] = useState(user ? user : {});
  const { id } = useParams();
  const navigate = useNavigate();

  // const [isEditing, setIsEditing] = useState(false);
  // const [values, setValues] = useState({
  //   phno: user.phno,
  //   email: user.email,
  //   qualification: user.qualification,
  //   experience: user.experience,
  // });
  const [isError, setIsError] = useState({ status: false, msg: "" });
  const role = getRole();

  const handleDelete = async () => {
    const token = getToken();
    if (role !== "admin") {
      alert("You don't have permission to do this operation");

      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/users/" + id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Unable to delete");
      alert("Deleted Successfully");
      navigate("/teacher-details");
    } catch (error) {
      alert(error.message);
      console.log(error.message);
    }
  };

  const handleChange = (e) => {
    setValues((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleSubmit = async () => {
    const token = getToken();
    setIsError({ status: false, msg: "" });

    try {
      const response = await fetch("http://localhost:3000/api/users/find/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Something went wrong");
      }

      const result = await response.json();
      // console.log(result.data);
      setUserSt(result.data.user);
    } catch (error) {
      console.log(error);
      setUserSt(userSt);
      setIsError({ status: true, msg: error.message });
    }
    setValues({
      phno: user.phno,
      email: user.email,
      qualification: user.qualification,
      experience: user.experience,
    });
  };

  return (
    <div className="mydetails-container">
      <div className="profile-card">
        <div className="profile-photo">
          <img src={userSt.profilePhoto || professor} alt={userSt.name} />
        </div>
        <div className="profile-info">
          <h1 className="name">{userSt.name}</h1>
          {isError.status && isError.msg && (
            <p className="error-message" style={{ color: "red" }}>
              {isError.msg}
            </p>
          )}

          <p>
            <strong>Designation:</strong>{" "}
            {userSt.designation ? userSt.designation : "Not specified"}
          </p>
          <p>
            <strong>Phone:</strong>
            {userSt.phno}
          </p>
          <p>
            <strong>Email:</strong> {userSt.email}
          </p>
          <p>
            <strong>Qualification:</strong>{" "}
            {userSt.qualification ? userSt.qualification : "Not specified"}
          </p>

          <p>
            <strong>Experience:</strong>{" "}
            {userSt.experience
              ? `${userSt.experience} year(s)`
              : "Not specified"}
          </p>

          {userSt.subjects && userSt.subjects.length > 0 && (
            <div className="subjects">
              <strong>Subjects:</strong>
              <ul>
                {userSt.subjects.map((subject, index) => (
                  <li key={index}>{subject}</li>
                ))}
              </ul>
            </div>
          )}

          {userSt.classesAssigned && userSt.classesAssigned.length > 0 && (
            <div className="classes-assigned">
              <strong>Classes Assigned:</strong>
              <ul>
                {userSt.classesAssigned.map((cls, index) => (
                  <li key={index}>
                    Year {cls.year} - Section {cls.section}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* <div>
            {!isEditing ? (
              <button
                onClick={() => {
                  setIsError({ status: false, msg: "" });
                  setIsEditing(true);
                }}
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  handleSubmit();
                }}
              >
                Submit
              </button>
            )}
          </div> */}

          <div>
            <button onClick={handleDelete} style={{ backgroundColor: "red" }}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const loader = async ({ request, params }) => {
  const token = getToken();
  if (!token) return redirect("/login");

  const response = await fetch("http://localhost:3000/api/users/" + params.id, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const result = await response.json();
    throw json(
      { message: result.message || "Something went wrong" },
      { status: response.status }
    );
  }

  const result = await response.json();
  return result;
};

export default TeacherProfile;
