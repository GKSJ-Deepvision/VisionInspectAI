import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "../context/AuthContext";

import toast from "react-hot-toast";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Bot,
  ArrowRight,
} from "lucide-react";

export default function Login() {

  const navigate = useNavigate();

  const { setToken } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
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

      const data = await login(form);

      setToken(data.access_token);

      toast.success("Welcome Back!");

      navigate("/dashboard");

    } catch (err) {

      const message =
        err.response?.data?.detail ||
        "Login Failed";

      setError(message);

      toast.error(message);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-cyan-600 to-indigo-700 flex items-center justify-center p-6">

      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative w-full max-w-md">

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">

          {/* Logo */}

          <div className="flex flex-col items-center mb-8">

            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl">

              <Bot
                size={40}
                className="text-white"
              />

            </div>

            <h1 className="text-3xl font-bold mt-5">

              VisionInspect AI

            </h1>

            <p className="text-gray-500 mt-2">

              Manufacturing Defect Detection

            </p>

          </div>

          {/* Error */}

          {error && (

            <div className="bg-red-100 border border-red-300 text-red-600 rounded-xl p-3 mb-5">

              {error}

            </div>

          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

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
                className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                className="w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-4 text-gray-500 hover:text-blue-600"
              >

                {showPassword ? (

                  <EyeOff size={20} />

                ) : (

                  <Eye size={20} />

                )}

              </button>

            </div>

            {/* Login Button */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-4
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                hover:from-blue-700
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

                  Logging In...

                </>

              ) : (

                <>

                  Login

                  <ArrowRight size={20} />

                </>

              )}

            </button>

          </form>

          {/* Register */}

          <div className="mt-8 text-center">

            <p className="text-gray-600">

              Don't have an account?

            </p>

            <Link
              to="/register"
              className="
                inline-block
                mt-3
                px-6
                py-3
                rounded-xl
                border-2
                border-blue-600
                text-blue-600
                font-semibold
                hover:bg-blue-600
                hover:text-white
                transition
              "
            >

              Create Account

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