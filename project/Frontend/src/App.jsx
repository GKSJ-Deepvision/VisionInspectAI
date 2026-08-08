import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inspection from './pages/Inspection.jsx'
import History from './pages/History.jsx'
import Analytics from './pages/Analytics.jsx'
import Reports from './pages/Reports.jsx'


// =====================================================
// PROTECTED ROUTE
// User must be logged in
// =====================================================

function ProtectedRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}


// =====================================================
// PERMISSION-BASED ROUTE
// User must be logged in and have required permission
// =====================================================

function PermissionRoute({ permission, children }) {
  const { user, hasPermission } = useAuth()

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but does not have permission
  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}


// =====================================================
// APPLICATION ROUTES
// =====================================================

export default function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* ================= DASHBOARD ================= */}

      <Route
        path="/dashboard"
        element={
          <PermissionRoute permission="dashboard">
            <Dashboard />
          </PermissionRoute>
        }
      />


      {/* ================= INSPECTION ================= */}

      <Route
        path="/inspection"
        element={
          <PermissionRoute permission="inspection">
            <Inspection />
          </PermissionRoute>
        }
      />


      {/* ================= HISTORY ================= */}

      <Route
        path="/history"
        element={
          <PermissionRoute permission="history">
            <History />
          </PermissionRoute>
        }
      />


      {/* ================= ANALYTICS ================= */}

      <Route
        path="/analytics"
        element={
          <PermissionRoute permission="analytics">
            <Analytics />
          </PermissionRoute>
        }
      />


      {/* ================= REPORTS ================= */}

      <Route
        path="/reports"
        element={
          <PermissionRoute permission="reports">
            <Reports />
          </PermissionRoute>
        }
      />


      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={
          <PermissionRoute permission="admin">
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold">
                  Admin Panel
                </h1>

                <p className="text-gray-400 mt-3">
                  User and system management will be available here.
                </p>
              </div>
            </div>
          </PermissionRoute>
        }
      />


      {/* ================= DEFAULT ROUTE ================= */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  )
}