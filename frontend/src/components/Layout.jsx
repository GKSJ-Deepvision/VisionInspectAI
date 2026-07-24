import Sidebar from "./Sidebar";
import { Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Layout({ title, children }) {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "Quality Engineer";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navbar */}
        <header className="border-b border-gray-700 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>

            <div className="mt-2">
              <p className="text-gray-400">
                Welcome back,
                <span className="text-emerald-400 font-semibold ml-2">
                  {username}
                </span>
                👋
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Role: {role}
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Notification */}
            {/*
            <button className="relative">
              <Bell
                size={22}
                className="text-gray-300 hover:text-emerald-400 transition cursor-pointer"
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
              
            <button className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 transition flex items-center justify-center shadow-lg">
              <User size={20} />
            </button>
            */}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export default Layout;