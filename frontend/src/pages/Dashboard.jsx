import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Layout from '../components/Layout.jsx'
import { getInspectionHistory } from '../services/api.js'

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    getInspectionHistory().then(setHistory)
  }, [])

  const total = history.length
  const failed = history.filter((h) => h.result === 'FAIL').length
  const passed = total - failed
  const critical = history.filter((h) => h.severity.level === 'Critical').length

  return (
      <Layout>
      <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-1">Inspection Dashboard</h1>
      <p className="text-gray-400 text-sm mb-6">Welcome, {user?.name} ({user?.role})</p>
    

      <div className="grid grid-cols-4 gap-4 mb-8 max-w-3xl">
        <StatCard label="Total Inspected" value={total} color="text-blue-400" />
        <StatCard label="Passed" value={passed} color="text-green-400" />
        <StatCard label="Failed" value={failed} color="text-red-400" />
        <StatCard label="Critical" value={critical} color="text-amber-400" />
      </div>

      
   </div>
    </Layout>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}