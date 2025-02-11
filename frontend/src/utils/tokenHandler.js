export const getToken = () => {
  return JSON.parse(localStorage.getItem("token-student"));
};
