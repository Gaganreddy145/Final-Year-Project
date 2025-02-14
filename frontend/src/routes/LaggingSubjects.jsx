import React, { useState } from "react";
import getURL from "../utils/getURLForNode";
import { getToken } from "../utils/tokenHandler";
import { useNavigate } from "react-router-dom";
import containsElective from "../utils/containsElective";

function LaggingSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState({
    lagSubjects: false,
    courseSuggestions: false,
  });
  const [isRequestMade, setIsRequestMade] = useState(false);
  const [isError, setIsError] = useState({ status: false, msg: "" });
  const [courses, setCourses] = useState({});
  const [electiveInputs, setElectiveInputs] = useState([]); // State to store elective input fields
  const navigate = useNavigate();

  const handleFetch = async () => {
    const token = getToken();
    if (!token) return navigate("/login");
    try {
      setIsRequestMade(false);
      setIsError({ status: false, msg: "" });
      setIsLoading((prev) => ({ ...prev, lagSubjects: true }));

      const response = await fetch(`${getURL()}students/subjects-lag`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Network response was not ok");
      }

      const data = await response.json();
      setSubjects(data.data.lagging_subjects);

      // Filter subjects that contain "Elective" and create input fields
      const electiveSubjects = data.data.lagging_subjects.filter((subject) =>
        containsElective(subject)
      );

      // Create JSX elements for elective subjects
      const inputs = electiveSubjects.map((subject, index) => (
        <div key={index} className="form-group">
          <label htmlFor={`subject-${index}`}>{subject}</label>
          <input
            type="text"
            id={`subject-${index}`}
            name={subject}
            placeholder={subject}
            required
          />
        </div>
      ));

      // Update state with the input fields
      setElectiveInputs(inputs);

      setIsRequestMade(true);
      setIsLoading((prev) => ({ ...prev, lagSubjects: false }));
    } catch (error) {
      setIsLoading((prev) => ({ ...prev, lagSubjects: false }));
      setIsError({
        status: true,
        msg: error.message || "Something went wrong!!!",
      });
    }
  };

  const handleCourseRecommendations = async (subs) => {
    const token = getToken();
    if (!token) return navigate("/login");
    try {
      setIsLoading((prev) => ({ ...prev, courseSuggestions: true }));

      const response = await fetch(
        `${getURL()}students/course-recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subjects: subs }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Something went wrong!!!");
      }

      const result = await response.json();
      setCourses(result.data.results);
      setIsLoading((prev) => ({ ...prev, courseSuggestions: false }));
      console.log(result.data.results);
    } catch (error) {
      setIsLoading((prev) => ({ ...prev, courseSuggestions: false }));
      console.log(error.message);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.target);
    const updatedSubjects = subjects.map((subject) => {
      if (containsElective(subject)) {
        // Update the subject name with the new value from the form
        return formData.get(subject) || subject;
      }
      return subject;
    });

    // Update the subjects state with the new values
    setSubjects(updatedSubjects);

    // Clear the elective inputs to hide the form
    setElectiveInputs([]);
  };

  return (
    <>
      <div className="lagging-subjects-container">
        <button
          className="fetch-button"
          onClick={handleFetch}
          disabled={isLoading.lagSubjects}
        >
          {isLoading.lagSubjects ? "Loading..." : "Lagging Subjects"}
        </button>

        {subjects.length > 0 && (
          <table className="subjects-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={subject || index}>
                  <td>{index + 1}</td>
                  <td>{subject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {isRequestMade && subjects.length === 0 && (
          <p className="no-lag-text">
            There are no lagging subjects. Your performance is good!{" "}
            <span>😁</span>
          </p>
        )}

        {isError.status && <p className="error-text">{isError.msg}</p>}
      </div>

      {/* Render the form with elective inputs if there are any */}
      {electiveInputs.length > 0 && (
        <form onSubmit={handleFormSubmit} className="elective-form">
          <h3>Update Elective Subjects</h3>
          {electiveInputs}
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      )}

      {/* Only show Course Recommendations button if there are lagging subjects */}
      {isRequestMade && subjects.length > 0 && electiveInputs.length === 0 && (
        <div className="course-recommendations-container">
          <button
            className="recommendations-button"
            onClick={() => handleCourseRecommendations(subjects)}
            disabled={isLoading.courseSuggestions}
          >
            {isLoading.courseSuggestions
              ? "Loading..."
              : "Course Recommendations"}
          </button>

          {/* Render the recommended courses */}
          {Object.keys(courses).map((subjectName) => {
            return (
              <div className="course-section" key={subjectName}>
                <h5 className="course-subject">{subjectName}</h5>
                {courses[subjectName].map((suggest) => {
                  const { videoUrl, thumbnail, videoId, title } = suggest;
                  return (
                    <div className="video-item" key={videoId}>
                      <h6 className="video-title">{title}</h6>
                      <iframe
                        width="640"
                        height="360"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Inline CSS */}
      <style>{`
        /* Container for lagging subjects */
        .lagging-subjects-container {
          padding: 20px;
          font-family: Arial, sans-serif;
          color: #333;
          background-color: #f9f9f9;
          border-radius: 8px;
          max-width: 600px;
          margin: 40px auto;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* Button for fetching lagging subjects */
        .fetch-button {
          background-color: #007bff;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s ease;
          margin-bottom: 20px;
        }
        .fetch-button:hover {
          background-color: #0056b3;
        }

        /* Table styling for lagging subjects */
        .subjects-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .subjects-table th, .subjects-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .subjects-table th {
          background-color: #007bff;
          color: white;
        }
        .subjects-table tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .subjects-table tr:hover {
          background-color: #ddd;
        }

        /* No lagging subjects text */
        .no-lag-text {
          margin-top: 20px;
          font-weight: bold;
        }
        .no-lag-text span {
          font-size: 1.2em;
        }

        /* Error text */
        .error-text {
          color: red;
          margin-top: 20px;
          font-weight: bold;
        }

        /* Container for course recommendations */
        .course-recommendations-container {
          padding: 20px;
          font-family: Arial, sans-serif;
          color: #333;
          background-color: #f9f9f9;
          border-radius: 8px;
          max-width: 600px;
          margin: 40px auto;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* Button for course recommendations */
        .recommendations-button {
          background-color: #28a745;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s ease;
          margin-bottom: 20px;
        }
        .recommendations-button:hover {
          background-color: #218838;
        }

        /* Course section heading */
        .course-section {
          margin-bottom: 30px;
        }
        .course-subject {
          margin: 20px 0 10px;
          font-size: 18px;
          color: #007bff;
        }

        /* Individual video item */
        .video-item {
          margin-bottom: 20px;
        }
        .video-title {
          margin: 10px 0;
          font-weight: normal;
          color: #333;
        }

        /* Form styling */
        .elective-form {
          padding: 20px;
          font-family: Arial, sans-serif;
          color: #333;
          background-color: #f9f9f9;
          border-radius: 8px;
          max-width: 600px;
          margin: 40px auto;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .elective-form h3 {
          margin-bottom: 20px;
          color: #007bff;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .form-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .submit-button {
          background-color: #28a745;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }

        .submit-button:hover {
          background-color: #218838;
        }
      `}</style>
    </>
  );
}

export default LaggingSubjects;