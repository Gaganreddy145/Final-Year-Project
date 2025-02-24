import { Outlet, useNavigation } from "react-router-dom";
import Loader from "../components/Loader";
import React from "react";

function RootLayout() {
  const navigate = useNavigation();
  return <div>{navigate.state === "loading" ? <Loader /> : <Outlet />}</div>;
}

export default RootLayout;
