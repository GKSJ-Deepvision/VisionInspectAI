import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Register User
export const register = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

// Login User
export const login = async (userData) => {
  const response = await API.post("/auth/login", userData);

  localStorage.setItem("token", response.data.access_token);

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