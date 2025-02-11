import React, { useState } from "react";
import "./UserForm.css";
import { getToken } from "../utils/tokenHandler";
import { useNavigate } from "react-router-dom";

function AddUserForm() {
  // Initialize the form state.
  const [formData, setFormData] = useState({
    name: "",
    phno: "",
    designation: "",
    email: "",
    password: "",
    qualification: "",
    experience: "",
    subjects: "", // We'll expect comma-separated values.
    // Start with one empty class; you can add more.
    classesAssigned: [{ year: "", section: "" }],
  });

  // Error state for handling and displaying error messages.
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Handle changes for most text/number inputs.
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear error when user starts typing
    setError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes for the classesAssigned fields.
  const handleClassChange = (index, field, value) => {
    const updatedClasses = [...formData.classesAssigned];
    updatedClasses[index][field] = value;
    setFormData((prev) => ({ ...prev, classesAssigned: updatedClasses }));
  };

  // Add a new class entry.
  const addClassField = () => {
    setFormData((prev) => ({
      ...prev,
      classesAssigned: [...prev.classesAssigned, { year: "", section: "" }],
    }));
  };

  // Remove a class entry.
  const removeClassField = (index) => {
    const updatedClasses = formData.classesAssigned.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, classesAssigned: updatedClasses }));
  };

  // Utility function to clean the payload.
  const cleanPayload = (payload) => {
    const cleaned = {};
    for (const key in payload) {
      const value = payload[key];

      // Remove if value is an empty string.
      if (typeof value === "string" && value.trim() === "") continue;

      // Remove if value is 0 (for numbers).
      if (typeof value === "number" && value === 0) continue;

      // Remove if value is an empty array.
      if (Array.isArray(value) && value.length === 0) continue;

      // If the value is an array of objects (for classesAssigned),
      // check if each object is empty.
      if (key === "classesAssigned" && Array.isArray(value)) {
        const nonEmptyClasses = value.filter(
          (cls) =>
            !(cls.year === "" || cls.year === 0) &&
            !(cls.section === "" || cls.section.trim() === "")
        );
        if (nonEmptyClasses.length === 0) continue;
        cleaned[key] = nonEmptyClasses;
        continue;
      }

      cleaned[key] = value;
    }
    return cleaned;
  };

  // Handle the form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Transform the comma-separated subjects string into an array.
    const subjectsArray = formData.subjects
      .split(",")
      .map((subj) => subj.trim())
      .filter((subj) => subj !== "");

    // Build the initial payload.
    const initialPayload = {
      ...formData,
      experience: Number(formData.experience),
      subjects: subjectsArray,
    };

    // Clean the payload by removing empty/zero values and empty arrays.
    const payload = cleanPayload(initialPayload);

    console.log("Submitting payload:", payload);

    const token = getToken();
    if (!token) {
      return navigate("/login");
    }

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Something went wrong!!!");
      }

      // On success, navigate back to the homepage or another route.
      navigate("/");
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New User</h2>

      {/* Error message display */}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="user-form">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="phno">Phone Number</label>
          <input
            type="text"
            id="phno"
            name="phno"
            value={formData.phno}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
          />
        </div>

        {/* Designation */}
        <div className="form-group">
          <label htmlFor="designation">Designation</label>
          <input
            type="text"
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Qualification */}
        <div className="form-group">
          <label htmlFor="qualification">Qualification</label>
          <input
            type="text"
            id="qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            placeholder="e.g. Ph.D, M.Tech"
          />
        </div>

        {/* Experience */}
        <div className="form-group">
          <label htmlFor="experience">Experience (years)</label>
          <input
            type="number"
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            min="0"
          />
        </div>

        {/* Subjects */}
        <div className="form-group">
          <label htmlFor="subjects">Subjects (comma separated)</label>
          <input
            type="text"
            id="subjects"
            name="subjects"
            value={formData.subjects}
            onChange={handleChange}
            placeholder="e.g. Data Structures, Algorithms"
          />
        </div>

        {/* Classes Assigned */}
        <div className="form-group classes-assigned">
          <label>Classes Assigned</label>
          {formData.classesAssigned.map((cls, index) => (
            <div key={index} className="class-assigned-group">
              <input
                type="number"
                placeholder="Year"
                value={cls.year}
                onChange={(e) =>
                  handleClassChange(index, "year", e.target.value)
                }
                required
              />
              <input
                type="text"
                placeholder="Section"
                value={cls.section}
                onChange={(e) =>
                  handleClassChange(index, "section", e.target.value)
                }
                required
              />
              {formData.classesAssigned.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeClassField(index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addClassField} className="add-btn">
            Add Class
          </button>
        </div>

        {/* Submit */}
        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
    </div>
  );
}

export default AddUserForm;
