import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inspection from './pages/Inspection.jsx'
import History from './pages/History.jsx'
import Analytics from './pages/Analytics.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inspection" element={<Inspection />} />
      <Route path="/history" element={<History />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}