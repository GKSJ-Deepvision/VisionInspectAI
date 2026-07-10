import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Lock,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("quality_engineer");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await registerUser(
        email,
        password,
        fullName,
        role
      );

      setSuccess("Registration successful! Redirecting to Login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error("REGISTER ERROR:", err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Response:", err.response.data);

        if (typeof err.response.data.detail === "string") {
          setError(err.response.data.detail);
        } else {
          setError(JSON.stringify(err.response.data.detail));
        }
      } else {
        setError(err.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-4">

      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-[#131A26]/40 p-8 shadow-xl backdrop-blur-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Operator Registration
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Create a new VisionInspect AI account
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Full Name
            </label>

            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />

              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-white/10 bg-slate-900/40 py-2.5 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

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
                placeholder="john@gmail.com"
                className="w-full rounded-lg border border-white/10 bg-slate-900/40 py-2.5 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-lg border border-white/10 bg-slate-900/40 py-2.5 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Role
            </label>

            <div className="relative">
              <ShieldAlert
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/40 py-2.5 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              >
                <option value="quality_engineer">
                  Quality Engineer
                </option>

                <option value="factory_supervisor">
                  Factory Supervisor
                </option>

                <option value="admin">
                  Administrator
                </option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="mt-6 text-center text-slate-400">

          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Sign In
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Register;
