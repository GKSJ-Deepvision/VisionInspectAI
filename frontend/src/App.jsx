import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

import Welcome from "./pages/Welcome";
import SupervisorWelcome from "./pages/SupervisorWelcome";

import Dashboard from "./pages/Dashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";

import Upload from "./pages/Upload";
import Inspection from "./pages/Inspection";
import Results from "./pages/Results";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  const role = localStorage.getItem("role");
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  return (
    <BrowserRouter>

      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* ================= ROLE BASED WELCOME ================= */}

        <Route
          path="/welcome"
          element={
            <ProtectedRoute>

              {role === "Factory Supervisor" ? (
                <SupervisorWelcome />
              ) : (
                <Welcome />
              )}

            </ProtectedRoute>
          }
        />


        {/* ================= DASHBOARD ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>

              {role === "Factory Supervisor" ? (
                <Navigate
                  to="/supervisor-dashboard"
                  replace
                />
              ) : (
                <Dashboard />
              )}

            </ProtectedRoute>
          }
        />


        {/* ================= UPLOAD ================= */}

        <Route
          path="/upload"
          element={
            <ProtectedRoute>

              {role === "Quality Engineer" ? (
                <Upload />
              ) : (
                <Navigate
                  to="/supervisor-dashboard"
                  replace
                />
              )}

            </ProtectedRoute>
          }
        />


        {/* ================= INSPECTION ================= */}

        <Route
          path="/inspection"
          element={
            <ProtectedRoute>
              <Inspection />
            </ProtectedRoute>
          }
        />


        {/* ================= RESULTS ================= */}

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />


        {/* ================= SUPERVISOR DASHBOARD ================= */}

        <Route
          path="/supervisor-dashboard"
          element={
            <ProtectedRoute>

              {role === "Factory Supervisor" ? (
                <SupervisorDashboard />
              ) : (
                <Navigate
                  to="/dashboard"
                  replace
                />
              )}

            </ProtectedRoute>
          }
        />


        {/* ================= SETTINGS ================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>

              {role === "Quality Engineer" ? (
                <Settings />
              ) : (
                <Navigate
                  to="/supervisor-dashboard"
                  replace
                />
              )}

            </ProtectedRoute>
          }
        />


        {/* ================= UNKNOWN ROUTES ================= */}

        <Route
          path="*"
          element={

            <Navigate
              to={
                !isLoggedIn
                  ? "/"
                  : role === "Factory Supervisor"
                  ? "/supervisor-dashboard"
                  : "/dashboard"
              }
              replace
            />

          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;