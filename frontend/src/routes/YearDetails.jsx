import React from "react";
import { json, redirect, useLoaderData, Link } from "react-router-dom";
import { getToken } from "./../utils/tokenHandler";

function YearDetails() {
  const data = useLoaderData();

  return (
    <div>
      <h1>Sections</h1>
      <ul>
        {data.data.sections.map((ele) => {
          const { _id } = ele;
          return (
            <li key={_id}>
              <Link to={`/${_id}`}>{_id}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const loader = async ({ request, params }) => {
  const token = getToken();
  if (!token) return redirect("/login"); ///fi/findSections/:year

  const response = await fetch(
    "http://localhost:3000/api/students/fi/findSections/" + params.year,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw json({ message: response.statusText }, { status: response.status });
  }
  const result = await response.json();

  return result;
};

export default YearDetails;
