import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Upload,
  Search,
  Settings,
} from "lucide-react";

function Sidebar() {

  const role =
    localStorage.getItem("role") || "Quality Engineer";

  const isSupervisor =
    role === "Factory Supervisor";

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10"
        : "text-gray-300 hover:bg-[#374151] hover:text-white"
    }`;

  return (
    <aside className="hidden md:flex w-64 min-h-screen bg-[#1F2937] border-r border-gray-700 flex-col">

      {/* ================= LOGO ================= */}

      <div className="p-6 border-b border-gray-700">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
            VI
          </div>

          <div>

            <h2 className="font-bold text-lg text-white">
              VisionInspect AI
            </h2>

            <p className="text-xs text-gray-400">
              Manufacturing Quality
              <br />
              Inspection
            </p>

          </div>

        </div>

      </div>


      {/* ================= MENU ================= */}

      <nav className="flex-1 p-4 space-y-2">

        {/* Dashboard */}

        <NavLink
          to={
            isSupervisor
              ? "/supervisor-dashboard"
              : "/dashboard"
          }
          className={menuClass}
        >

          <LayoutDashboard size={20} />

          Dashboard

        </NavLink>


        {/* Upload - Quality Engineer */}

        {!isSupervisor && (

          <NavLink
            to="/upload"
            className={menuClass}
          >

            <Upload size={20} />

            Upload

          </NavLink>

        )}


        {/* Inspection - Both */}

        <NavLink
          to="/inspection"
          className={menuClass}
        >

          <Search size={20} />

          Inspection

        </NavLink>


        {/* Settings - Quality Engineer */}

        {!isSupervisor && (

          <NavLink
            to="/settings"
            className={menuClass}
          >

            <Settings size={20} />

            Settings

          </NavLink>

        )}

      </nav>


      {/* ================= ROLE ================= */}

      <div className="p-4 border-t border-gray-700">

        <div className="bg-[#111827] rounded-xl p-3">

          <p className="text-xs text-gray-500">
            Logged in as
          </p>

          <p className="text-sm text-emerald-400 font-semibold mt-1">
            {role}
          </p>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;
