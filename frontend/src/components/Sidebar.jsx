import {
  LayoutDashboard,
  ScanSearch,
  History,
  BarChart3,
  FileText,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {

  const navigate = useNavigate();

  const { signOut } = useAuth();

  const handleLogout = () => {

    signOut();

    navigate("/");

  };

  const menuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },

    {
      name: "Predict",
      path: "/predict",
      icon: <ScanSearch size={20} />,
    },

    {
      name: "History",
      path: "/history",
      icon: <History size={20} />,
    },

    {
      name: "Analytics",
      path: "/analytics",
      icon: <BarChart3 size={20} />,
    },

    {
      name: "Reports",
      path: "/reports",
      icon: <FileText size={20} />,
    },

    {
      name: "Profile",
      path: "/profile",
      icon: <User size={20} />,
    },

  ];

  return (

    <aside
      className="
      w-72
      min-h-screen
      bg-slate-900
      text-white
      flex
      flex-col
      shadow-2xl
    "
    >

      {/* Logo */}

      <div className="p-8 border-b border-slate-700">

        <div className="flex items-center gap-4">

          <div
            className="
            w-14
            h-14
            rounded-xl
            bg-gradient-to-r
            from-cyan-500
            to-blue-600
            flex
            items-center
            justify-center
          "
          >

            <ShieldCheck size={28} />

          </div>

          <div>

            <h1 className="text-xl font-bold">

              VisionInspect AI

            </h1>

            <p className="text-sm text-slate-400">

              Manufacturing System

            </p>

          </div>

        </div>

      </div>

      {/* Menu */}

      <div className="flex-1 px-5 py-6 space-y-2">
                {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
              flex
              items-center
              gap-4
              px-5
              py-4
              rounded-xl
              transition-all
              duration-300
              font-medium
              ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }
            `
            }
          >
            {item.icon}

            <span>{item.name}</span>

          </NavLink>

        ))}

      </div>

      {/* Footer */}

      <div className="border-t border-slate-700 p-5">

        <button
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-3
            bg-red-600
            hover:bg-red-700
            transition
            py-3
            rounded-xl
            font-semibold
          "
        >

          <LogOut size={20} />

          Logout

        </button>

        <div className="mt-6 text-center">

          <p className="text-xs text-slate-500">
            VisionInspect AI
          </p>

          <p className="text-xs text-slate-600 mt-1">
            Version 2.0
          </p>

        </div>

      </div>

    </aside>

  );

}
