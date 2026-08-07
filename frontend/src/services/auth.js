import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Register User
export const register = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

// Login User
export const login = async (userData) => {

  const formData = new URLSearchParams();

  formData.append("username", userData.email);
  formData.append("password", userData.password);

  const response = await API.post(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  localStorage.setItem(
    "token",
    response.data.access_token
  );

  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
};

// Get Token
export const getToken = () => {
  return localStorage.getItem("token");
};

export default API;