import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 shadow-xl">

      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        {/* Left Side */}

        <div className="flex items-center gap-4">

          <div className="bg-white text-blue-700 rounded-xl w-12 h-12 flex items-center justify-center text-2xl shadow-lg">
            🤖
          </div>

          <div>

            <h1 className="text-2xl font-bold text-white tracking-wide">
              VisionInspect AI
            </h1>

            <p className="text-blue-100 text-sm">
              Manufacturing Quality Inspection Platform
            </p>

          </div>

        </div>

        {/* Right Side */}

        <div className="flex items-center gap-6">

          <div className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">

            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>

            <span className="text-white text-sm font-medium">
              AI Engine Active
            </span>

          </div>

          <div className="hidden lg:block text-right">

            <p className="text-white font-semibold">
              Welcome
            </p>

            <p className="text-blue-100 text-sm">
              Inspector
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="
              bg-red-500
              hover:bg-red-600
              transition-all
              duration-300
              px-5
              py-2
              rounded-xl
              shadow-lg
              font-semibold
              text-white
              hover:scale-105
            "
          >
            🚪 Logout
          </button>

        </div>

      </div>

    </nav>
  );
}