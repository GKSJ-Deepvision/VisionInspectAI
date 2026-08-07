import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth";

import toast from "react-hot-toast";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Bot,
  ArrowRight,
} from "lucide-react";

export default function Register() {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [error, setError] =
    useState("");

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      await register(form);

      toast.success("Account Created Successfully!");

      navigate("/");

    } catch (err) {

      const message =
        err.response?.data?.detail ||
        "Registration Failed";

      setError(message);

      toast.error(message);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-600 via-cyan-600 to-blue-700 flex justify-center items-center p-6">

      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative w-full max-w-md">

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">

          {/* Logo */}

          <div className="flex flex-col items-center mb-8">

            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-600 to-cyan-500 flex items-center justify-center shadow-xl">

              <Bot
                size={40}
                className="text-white"
              />

            </div>

            <h1 className="text-3xl font-bold mt-5">
              VisionInspect AI
            </h1>

            <p className="text-gray-500 mt-2">
              Create Your Account
            </p>

          </div>

          {/* Error */}

          {error && (

            <div className="bg-red-100 border border-red-300 text-red-600 rounded-xl p-3 mb-5">

              {error}

            </div>

          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Full Name */}

            <div className="relative">

              <User
                size={20}
                className="absolute left-4 top-4 text-gray-400"
              />

              <input
                name="full_name"
                placeholder="Full Name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
              />

            </div>

            {/* Email */}

            <div className="relative">

              <Mail
                size={20}
                className="absolute left-4 top-4 text-gray-400"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
              />

            </div>

            {/* Password */}

            <div className="relative">

              <Lock
                size={20}
                className="absolute left-4 top-4 text-gray-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-4 text-gray-500 hover:text-green-600"
              >

                {showPassword ? (

                  <EyeOff size={20} />

                ) : (

                  <Eye size={20} />

                )}

              </button>

            </div>

            {/* Register Button */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-4
                rounded-xl
                bg-gradient-to-r
                from-green-600
                to-cyan-500
                hover:from-green-700
                hover:to-cyan-600
                text-white
                font-semibold
                flex
                justify-center
                items-center
                gap-2
                transition
                duration-300
                hover:scale-105
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              {loading ? (

                <>

                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                  Creating Account...

                </>

              ) : (

                <>

                  Register

                  <ArrowRight size={20} />

                </>

              )}

            </button>

          </form>

          {/* Login */}

          <div className="mt-8 text-center">

            <p className="text-gray-600">

              Already have an account?

            </p>

            <Link
              to="/"
              className="
                inline-block
                mt-3
                px-6
                py-3
                rounded-xl
                border-2
                border-green-600
                text-green-600
                font-semibold
                hover:bg-green-600
                hover:text-white
                transition
              "
            >

              Login Now

            </Link>

          </div>

          {/* Footer */}

          <div className="mt-8 border-t pt-5">

            <p className="text-center text-sm text-gray-500">

              © 2026 VisionInspect AI

            </p>

            <p className="text-center text-xs text-gray-400 mt-1">

              AI Manufacturing Defect Detection & Quality Inspection

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}