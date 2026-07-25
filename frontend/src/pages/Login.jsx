import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await login(form);

      setToken(data.access_token);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Login
        </h2>

        {error && (
          <p className="text-red-500 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          <input
            className="w-full border p-3 rounded mb-4"
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          <input
            className="w-full border p-3 rounded mb-4"
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Login
          </button>

        </form>

        <p className="mt-4 text-center">
          Don't have an account?

          <Link
            className="text-blue-600 ml-2"
            to="/register"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}