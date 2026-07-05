import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-1">Inspection Dashboard</h1>
      <p className="text-gray-400 text-sm mb-6">Welcome, {user?.name} ({user?.role})</p>

      <div className="grid grid-cols-4 gap-4 mb-8 max-w-3xl">
        <StatCard label="Total Inspected" value={total} color="text-blue-400" />
        <StatCard label="Passed" value={passed} color="text-green-400" />
        <StatCard label="Failed" value={failed} color="text-red-400" />
        <StatCard label="Critical" value={critical} color="text-amber-400" />
      </div>

      <p className="text-sm text-gray-300 mb-3">Recent Inspections</p>

      {history.length === 0 ? (
        <div className="border border-dashed border-gray-700 rounded-lg p-10 text-center text-gray-500 text-sm max-w-3xl">
          No inspections yet. Go to Image Upload to run your first scan.
        </div>
      ) : (
        <div className="border border-gray-700 rounded-lg overflow-hidden max-w-3xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">File</th>
                <th className="text-left px-4 py-3">Defect</th>
                <th className="text-left px-4 py-3">Severity</th>
                <th className="text-left px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.id} className="border-t border-gray-700">
                  <td className="px-4 py-3 text-gray-300">{r.fileName}</td>
                  <td className="px-4 py-3">{r.defectType}</td>
                  <td className="px-4 py-3">{r.severity.level} · {r.severity.score}</td>
                  <td className="px-4 py-3">
                    <span className={r.result === 'FAIL' ? 'text-red-400' : 'text-green-400'}>
                      {r.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
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