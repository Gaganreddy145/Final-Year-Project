import { redirect } from "react-router-dom";
export const logoutAction = () => {
  localStorage.removeItem("token-student");
  return redirect("/login");
};
