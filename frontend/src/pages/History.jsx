import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { getInspectionHistory } from '../services/api.js'

export default function History() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    getInspectionHistory().then(setHistory)
  }, [])

  return (
    <Layout>
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold mb-1">Inspection History</h1>
        <p className="text-gray-400 text-sm mb-6">Full record of past inspections.</p>

        {history.length === 0 ? (
          <div className="border border-dashed border-gray-700 rounded-lg p-10 text-center text-gray-500 text-sm max-w-3xl">
            No inspections yet. Go to Inspection to run your first scan.
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
    </Layout>
  )
}