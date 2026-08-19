import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.username || !formData.password) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8000/login",
        {
          username: formData.username,
          password: formData.password,
        }
      );

      if (response.data.success) {
        // Store fresh login session
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("role", response.data.role);

        /*
          Reload the application so App.jsx reads
          the latest role from localStorage.
        */
        window.location.replace("/welcome");
      } else {
        setError(
          response.data.message || "Invalid Username or Password"
        );
      }
    } catch (err) {
      console.error("Login error:", err);

      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center px-6 relative overflow-hidden">

      {/* Background */}
      <div className="absolute w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full -top-20 -left-20" />

      <div className="absolute w-80 h-80 bg-amber-400/20 blur-3xl rounded-full bottom-0 right-0" />

      <div className="relative bg-[#1F2937]/90 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-3xl w-full max-w-md p-8">

        {/* Logo */}
        <div className="flex justify-center">

          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-3xl font-bold text-white">
            AI
          </div>

        </div>

        <h1 className="text-3xl font-bold text-center text-white mt-6">
          VisionInspect AI
        </h1>

        <p className="text-center text-gray-400 mt-2">
          Smart Manufacturing Quality Inspection
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">

          {/* Username */}
          <div className="relative">

            <User
              size={20}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-[#111827] border border-gray-600 rounded-xl py-3 pl-12 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
            />

          </div>

          {/* Password */}
          <div className="relative">

            <Lock
              size={20}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#111827] border border-gray-600 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>

          </div>

          {/* Remember */}
          <div className="flex justify-between items-center text-sm text-gray-400">

            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="accent-emerald-500"
              />

              Remember Me

            </label>

            <Link
              to="/forgot-password"
              className="hover:text-emerald-400"
            >
              Forgot Password?
            </Link>

          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-300 text-center">
              {error}
            </div>
          )}

          {/* Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center my-6">

          <div className="flex-1 h-px bg-gray-700" />

          <span className="px-3 text-gray-500">
            OR
          </span>

          <div className="flex-1 h-px bg-gray-700" />

        </div>

        {/* Signup */}
        <p className="text-center text-gray-400">

          Don't have an account?

          <Link
            to="/signup"
            className="ml-2 text-emerald-400 font-semibold"
          >
            Create Account
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;