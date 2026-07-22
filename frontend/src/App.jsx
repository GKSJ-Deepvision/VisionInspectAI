import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Reports from './pages/Reports.jsx'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inspection from './pages/Inspection.jsx'
import History from './pages/History.jsx'
import Analytics from './pages/Analytics.jsx'


// Protect pages that require login
function ProtectedRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}


// Only Quality Engineers can access Analytics
function QualityEngineerRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'Quality Engineer') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}


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


      {/* ================= PROTECTED ROUTES ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inspection"
        element={
          <ProtectedRoute>
            <Inspection />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />


      {/* ================= QUALITY ENGINEER ONLY ================= */}

      <Route
        path="/analytics"
        element={
          <QualityEngineerRoute>
            <Analytics />
          </QualityEngineerRoute>
        }
      />


      {/* ================= DEFAULT ================= */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

      <Route path="/reports" element={<Reports />} />

    </Routes>
  )
}