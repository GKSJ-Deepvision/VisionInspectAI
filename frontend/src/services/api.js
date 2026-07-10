import axios from "axios";

// Backend Base URL
const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Authentication

export const loginUser = async (userData) => {
  return await API.post("/login", userData);
};

// Image Upload


export const uploadImage = async (formData) => {
  return await API.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Inspection


export const inspectImage = async () => {
  return await API.get("/inspection");
};

export default API;