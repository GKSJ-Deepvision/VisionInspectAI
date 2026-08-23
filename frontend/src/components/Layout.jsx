import { useState } from "react";
import Sidebar from "./Sidebar";
import { LogOut, Menu } from "lucide-react";

function Layout({ title, children }) {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const username =
    localStorage.getItem("username") || "User";

  const role =
    localStorage.getItem("role") || "Quality Engineer";

  const handleLogout = () => {

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white flex">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">

        {/* Top Navbar */}
        <header className="border-b border-gray-700 px-4 py-4 md:px-8 md:py-5 flex items-center justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">

            {/* Hamburger - Mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-[#374151] flex-shrink-0"
            >
              <Menu size={24} />
            </button>

            <div className="min-w-0">

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                {title}
              </h1>

              <div className="mt-1 sm:mt-2">

                <p className="text-sm sm:text-base text-gray-400 truncate">

                  Welcome back,

                  <span className="text-emerald-400 font-semibold ml-2">
                    {username}
                  </span>

                  👋

                </p>

                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                  Role: {role}
                </p>

              </div>

            </div>

          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex-shrink-0 flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg"
          >

            <LogOut size={18} />

            <span className="hidden sm:inline">
              Logout
            </span>

          </button>

        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 md:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}

export default Layout;
