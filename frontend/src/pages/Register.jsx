import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth";

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
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

      await register(form);

      navigate("/");

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Registration failed"
      );

    }

  };

  return (

    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Register
        </h2>

        {error && (
          <p className="text-red-500 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          <input
            className="w-full border p-3 rounded mb-4"
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
          />

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
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
          >
            Register
          </button>

        </form>

        <p className="mt-4 text-center">

          Already have an account?

          <Link
            className="text-blue-600 ml-2"
            to="/"
          >
            Login
          </Link>

        </p>

      </div>

    </div>

  );

}