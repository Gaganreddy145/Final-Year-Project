import React from "react";
import { useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();
  console.log(error);

  let title =
    error.data && error.data.message
      ? error.data.message
      : "---Something went wrong!!!---";

  return (
    <div className="error-container">
      <style>{`
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f8d7da;
          color: #721c24;
          padding: 20px;
          text-align: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .error-container h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }
        .error-container p {
          font-size: 1.2rem;
          margin-top: 10px;
        }
        .error-container .error-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }
      `}</style>
      <div className="error-icon">🚫</div>
      <h1>{title}</h1>
      <p>Please try again later or contact support if the problem persists.</p>
    </div>
  );
}

export default ErrorPage;
