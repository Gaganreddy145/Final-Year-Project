import {jwtDecode} from "jwt-decode";
import { getToken } from "./tokenHandler";

const getRole = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = jwtDecode(token);
  const role = decoded.role;
  return role;
};

export default getRole;
