import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    // Temporary (Later connect to backend)
    setMessage("Password reset link has been sent to your email.");
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full -top-20 -left-20"></div>
      <div className="absolute w-80 h-80 bg-yellow-400/10 blur-3xl rounded-full bottom-0 right-0"></div>

      <div className="w-full max-w-md bg-[#1F2937]/90 backdrop-blur-lg border border-gray-700 rounded-3xl shadow-2xl p-8">

        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            AI
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-white mt-6">
          Forgot Password
        </h1>

        <p className="text-center text-gray-400 mt-2">
          Enter your email to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <div className="relative">

            <Mail
              className="absolute left-4 top-4 text-gray-400"
              size={20}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111827] border border-gray-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

          </div>

          {message && (
            <div className="bg-emerald-500/20 border border-emerald-500 rounded-lg p-3 text-emerald-300 text-sm text-center">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 transition duration-300 text-white font-semibold py-3 rounded-xl shadow-lg"
          >
            Send Reset Link
          </button>

        </form>

        <div className="mt-6 text-center">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
          >
            <ArrowLeft size={18} />
            Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;