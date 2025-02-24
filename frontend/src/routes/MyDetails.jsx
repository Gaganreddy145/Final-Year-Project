import React, { useState } from "react";
import { getToken } from "../utils/tokenHandler";
import { redirect, json, useLoaderData, Form, useNavigate } from "react-router-dom";
import "./MyDetails.css";
import professor from "./../../../professor.png";
import getRole from "../utils/decodeRole";
import getURL from "../utils/getURLForNode";

function MyDetails() {
  // Destructure the user object from the loaded data
  const {
    data: { doc: user },
  } = useLoaderData();

  const [userSt, setUserSt] = useState(user ? user : {});
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState({
    phno: user.phno,
    email: user.email,
    qualification: user.qualification,
    experience: user.experience,
  });
  const [isError, setIsError] = useState({ status: false, msg: "" });
  const [isChanging, setIsChanging] = useState(false);
  const [passValues, setPassValues] = useState({
    passwordCurrent: "",
    password: "",
  });
  const [isLoading,setIsLoading] = useState(false);
  const role = getRole();

  const handleChange = (e) => {
    setValues((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handlePassChange = (e) => {
    setPassValues((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handlePassSubmit = async () => {

    const token = getToken();
    if (!token) return navigate("/login");
    try {
      const response = await fetch(`${getURL()}users/updateMyPassword`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passValues),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Something went wrong!!!");
      }
      localStorage.removeItem("token-student");
      setIsChanging(false);
      alert("Successfully password has updated...")
      return navigate("/login");
    } catch (error) {
      alert(error.message || "Something went wrong!!!");
      // setIsChanging(false);
    }
  };

  const handleSubmit = async () => {
    const token = getToken();
    setIsError({ status: false, msg: "" });
    setIsLoading(true);
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
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setUserSt(userSt);
      setIsLoading(false);
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
            <strong>Phone:</strong> {!isEditing && userSt.phno}
            {isEditing && (
              <input
                type="number"
                name="phno"
                value={values.phno}
                onChange={handleChange}
                required
              />
            )}
          </p>
          <p>
            <strong>Email:</strong> {!isEditing && userSt.email}
            {isEditing && (
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                required
              />
            )}
          </p>
          {role === "teacher" && (
            <p>
              <strong>Qualification:</strong>{" "}
              {userSt.qualification
                ? !isEditing && userSt.qualification
                : "Not specified"}
              {isEditing && (
                <input
                  type="text"
                  name="qualification"
                  value={values.qualification}
                  onChange={handleChange}
                  required
                />
              )}
            </p>
          )}
          {role === "teacher" && (
            <p>
              <strong>Experience:</strong>{" "}
              {userSt.experience
                ? !isEditing && `${userSt.experience} year(s)`
                : "Not specified"}
              {isEditing && (
                <input
                  type="number"
                  name="experience"
                  value={values.experience}
                  onChange={handleChange}
                  required
                />
              )}
            </p>
          )}
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

          <div>
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
               disabled={isLoading}
                onClick={() => {
                  setIsEditing(false);
                  handleSubmit();
                }}
              >
               {isLoading ? "Submitting..." : " Submit"}
              </button>
            )}
          </div>
          <div>
            {!isChanging ? (
              <button onClick={() => setIsChanging(true)}>
                Change Password
              </button>
            ) : (
              <button onClick={handlePassSubmit}>Submit</button>
            )}
          </div>
          {isChanging && (
            <div >
              <strong>Current Password:</strong>
              <input
                type="password"
                name="passwordCurrent"
                value={passValues.passwordCurrent}
                onChange={handlePassChange}
              />
            </div>
          )}
          {isChanging && (
            <div>
              <strong>New Password:</strong>
              <input
                type="password"
                name="password"
                value={passValues.password}
                onChange={handlePassChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const loader = async () => {
  const token = getToken();
  if (!token) return redirect("/login");

  const response = await fetch("http://localhost:3000/api/users/find/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok)
    throw json({ message: response.statusText }, { status: response.status });

  const result = await response.json();
  return result;
};

export default MyDetails;
