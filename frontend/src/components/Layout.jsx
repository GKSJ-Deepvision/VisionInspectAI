import Sidebar from "./Sidebar";
import { LogOut } from "lucide-react";

function Layout({ title, children }) {

  const username =
    localStorage.getItem("username") || "User";

  const role =
    localStorage.getItem("role") || "Quality Engineer";

  const handleLogout = () => {

    // Clear current user session completely
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    // Reload application and go to login
    window.location.replace("/");
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

            <h1 className="text-3xl font-bold">
              {title}
            </h1>

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

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg"
          >

            <LogOut size={18} />

            Logout

          </button>

        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>

      </div>

    </div>
  );
}

export default Layout;