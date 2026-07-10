import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  Search,
  BarChart3,
  Settings,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

 const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  navigate("/");
 };

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-emerald-500 text-white"
        : "text-gray-300 hover:bg-[#374151] hover:text-white"
    }`;

  return (
    <aside className="w-64 min-h-screen bg-[#1F2937] border-r border-gray-700 flex flex-col">

      {/* Logo */}

      <div className="p-6 border-b border-gray-700">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl">
            AI
          </div>

          <div>

            <h2 className="font-bold text-lg text-white">
              VisionInspect
            </h2>

            <p className="text-xs text-gray-400">
              AI Inspection
            </p>

          </div>

        </div>

      </div>

      {/* Menu */}

      <nav className="flex-1 p-4 space-y-2">

        <NavLink to="/dashboard" className={menuClass}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink to="/upload" className={menuClass}>
          <Upload size={20} />
          Upload
        </NavLink>

        <NavLink to="/inspection" className={menuClass}>
          <Search size={20} />
          Inspection
        </NavLink>

        <NavLink to="/results" className={menuClass}>
          <BarChart3 size={20} />
          Results
        </NavLink>

        <NavLink to="/settings" className={menuClass}>
          <Settings size={20} />
          Settings
        </NavLink>

      </nav>

      

    </aside>
  );
}

export default Sidebar;