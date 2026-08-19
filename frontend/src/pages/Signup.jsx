import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
} from "lucide-react";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Quality Engineer",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear messages when user changes the form
    setError("");
    setSuccess("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ============================
    // Factory Supervisor Restriction
    // ============================

    if (formData.role === "Factory Supervisor") {
      setError(
        "Factory Supervisor account already exists. Only one Factory Supervisor account is allowed. Please select Quality Engineer to create a new account."
      );
      return;
    }

    // ============================
    // Required Field Validation
    // ============================

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role
    ) {
      setError("Please fill all fields.");
      return;
    }

    // ============================
    // Password Validation
    // ============================

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/signup",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }
      );

      if (response.data.success) {
        setSuccess(response.data.message);

        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "Quality Engineer",
        });

        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to create account.");
      }
    }
  };

  // Factory Supervisor selected or not
  const isSupervisor = formData.role === "Factory Supervisor";

  return (
    <div className="min-h-screen bg-[#111827] flex justify-center items-center px-6 relative overflow-hidden">

      {/* Background Effects */}

      <div className="absolute w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full -top-20 -left-20"></div>

      <div className="absolute w-80 h-80 bg-yellow-400/10 blur-3xl rounded-full bottom-0 right-0"></div>

      {/* Signup Card */}

      <div className="bg-[#1F2937]/90 backdrop-blur-lg border border-gray-700 rounded-3xl shadow-2xl w-full max-w-md p-8">

        {/* Logo */}

        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
            AI
          </div>
        </div>

        {/* Heading */}

        <h1 className="text-center text-3xl font-bold text-white mt-5">
          Create Account
        </h1>

        <p className="text-center text-gray-400 mt-2">
          Join VisionInspect AI
        </p>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">

          {/* ============================
              Username
              ============================ */}

          <div className="relative">
            <User
              size={20}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full bg-[#111827] border border-gray-600 rounded-xl py-3 pl-12 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* ============================
              Email
              ============================ */}

          <div className="relative">
            <Mail
              size={20}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full bg-[#111827] border border-gray-600 rounded-xl py-3 pl-12 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* ============================
              Password
              ============================ */}

          <div className="relative">
            <Lock
              size={20}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full bg-[#111827] border border-gray-600 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
            />

            <button
              type="button"
              className="absolute right-4 top-4 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {/* ============================
              Confirm Password
              ============================ */}

          <div className="relative">
            <Lock
              size={20}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full bg-[#111827] border border-gray-600 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
            />

            <button
              type="button"
              className="absolute right-4 top-4 text-gray-400"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {/* ============================
              Role
              ============================ */}

          <div className="relative">
            <Briefcase
              size={20}
              className="absolute left-4 top-4 text-gray-400"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-[#111827] border border-gray-600 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Quality Engineer">
                Quality Engineer
              </option>

              <option value="Factory Supervisor">
                Factory Supervisor
              </option>
            </select>
          </div>

          {/* ============================
              Factory Supervisor Warning
              ============================ */}

          {isSupervisor && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 text-yellow-300 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-base">
                  ⚠
                </span>

                <p>
                  Factory Supervisor account already exists.
                  Only one Factory Supervisor account is allowed.
                  Please select Quality Engineer to create a new
                  account.
                </p>
              </div>
            </div>
          )}

          {/* ============================
              Error
              ============================ */}

          {error && !isSupervisor && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* ============================
              Success
              ============================ */}

          {success && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-300 text-sm">
              {success}
            </div>
          )}

          {/* ============================
              Signup Button
              ============================ */}

          <button
            type="submit"
            disabled={isSupervisor}
            className={`w-full transition text-white font-semibold py-3 rounded-xl shadow-lg ${
              isSupervisor
                ? "bg-gray-600 cursor-not-allowed opacity-60"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            Create Account
          </button>

        </form>

        {/* Divider */}

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-700"></div>

          <span className="px-3 text-gray-500 text-sm">
            OR
          </span>

          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Login */}

        <p className="text-center text-gray-400">
          Already have an account?

          <Link
            to="/"
            className="text-emerald-400 font-semibold ml-2 hover:text-emerald-300"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;