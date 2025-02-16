import React, { useState } from "react";
import { getToken } from "../utils/tokenHandler";
import { redirect, json, useLoaderData, useNavigate } from "react-router-dom";
import styles from "./StudentDetail.module.css";
import professor from "./../../../custom image.png";
import getURL from "../utils/getURLForNode";

function StudentDetail() {
  const {
    data: { doc: user },
  } = useLoaderData();

  const [userSt, setUserSt] = useState(user || {});
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState({
    name: user.name,
    phno: user.phno,
    email: user.email,
  });
  const [isError, setIsError] = useState({ status: false, msg: "" });
  const [isChanging, setIsChanging] = useState(false);
  const [passValues, setPassValues] = useState({
    passwordCurrent: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
      const response = await fetch(`${getURL()}students/updateMyPassword`, {
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

    try {
      const response = await fetch(`${getURL()}students/find/me`, {
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
      setUserSt(result.data.user);
    } catch (error) {
      console.log(error);
      setIsError({ status: true, msg: error.message });
    }
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.photoSection}>
          <img
            src={userSt.profilePhoto || professor}
            alt={userSt.name}
            className={styles.profilePhoto}
          />
        </div>
        <div className={styles.infoSection}>
          {isError.status && <p className={styles.error}>{isError.msg}</p>}
          <div className={styles.infoRow}>
            <strong>Name:</strong>
            {!isEditing ? (
              <span>{userSt.name}</span>
            ) : (
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
              />
            )}
          </div>
          <div className={styles.infoRow}>
            <strong>Year:</strong>
            <span>{userSt.year}</span>
          </div>
          <div className={styles.infoRow}>
            <strong>Current Semester:</strong>
            <span>{userSt.currentSem}</span>
          </div>
          <div className={styles.infoRow}>
            <strong>Phone:</strong>
            {!isEditing ? (
              <span>{userSt.phno}</span>
            ) : (
              <input
                type="text"
                name="phno"
                value={values.phno}
                onChange={handleChange}
              />
            )}
          </div>
          <div className={styles.infoRow}>
            <strong>Email:</strong>
            {!isEditing ? (
              <span>{userSt.email}</span>
            ) : (
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
              />
            )}
          </div>
          <div className={styles.infoRow}>
            <strong>Section:</strong>
            <span>{userSt.section}</span>
          </div>
          <div className={styles.buttonContainer}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            ) : (
              <button onClick={handleSubmit}>Submit</button>
            )}
          </div>
          <div className={styles.buttonContainer}>
            {!isChanging ? (
              <button onClick={() => setIsChanging(true)}>
                Change Password
              </button>
            ) : (
              <button onClick={handlePassSubmit}>Submit</button>
            )}
          </div>
          {isChanging && (
            <div className={styles.infoRow}>
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
            <div className={styles.infoRow}>
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

  const response = await fetch(`${getURL()}students/find/me`, {
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

export default StudentDetail;
