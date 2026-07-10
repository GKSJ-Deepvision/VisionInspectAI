import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "quality_engineer") {
        navigate("/upload");
      } else if (user.role === "factory_supervisor") {
        navigate("/dashboard");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-[#131A26]/40 p-8 shadow-xl backdrop-blur-md">

        <div className="mb-8 flex flex-col items-center gap-2">
          <svg
            className="h-12 w-12"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>

            <rect width="100" height="100" rx="20" fill="url(#logo)" />

            <circle
              cx="50"
              cy="50"
              r="25"
              fill="none"
              stroke="white"
              strokeWidth="6"
            />

            <circle cx="50" cy="50" r="10" fill="white" />

            <path
              d="M68 32 L80 20"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          <h1 className="text-3xl font-bold text-white">
            VisionInspect AI
          </h1>

          <p className="text-slate-400">
            Operator Login
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@visioninspect.com"
                className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <p className="mt-6 text-center text-slate-400">
          New Operator?{" "}
          <Link
            to="/register"
            className="font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
