import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getInspectionHistory } from '../services/api.js'

export default function History() {
  const { user } = useAuth()

  const [history, setHistory] = useState([])
  const [search, setSearch] = useState('')
  const [resultFilter, setResultFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load real inspection history from backend
  useEffect(() => {
    async function loadHistory() {
      if (!user?.token) {
        setError('Authentication token not found. Please login again.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await getInspectionHistory(user.token)

        // Backend may return either an array
        // or an object containing history/results
        const records = Array.isArray(data)
          ? data
          : data.history || data.results || data.inspections || []

        setHistory(records)
      } catch (err) {
        console.error('Failed to load history:', err)
        setError(
          err.message || 'Failed to load inspection history.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user?.token])

  const total = history.length

  const passed = history.filter(
    item =>
      item.result === 'PASS' ||
      item.status === 'PASS' ||
      item.status === 'passed'
  ).length

  const failed = history.filter(
    item =>
      item.result === 'FAIL' ||
      item.status === 'FAIL' ||
      item.status === 'failed'
  ).length

  const critical = history.filter(item => {
    const severity =
      item.severity?.level ||
      item.severity ||
      item.severity_level ||
      ''

    return severity === 'Critical'
  }).length

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const defect =
        item.defect ||
        item.defect_type ||
        item.defectType ||
        ''

      const severity =
        item.severity?.level ||
        item.severity ||
        item.severity_level ||
        ''

      const fileName =
        item.file ||
        item.filename ||
        item.fileName ||
        ''

      const result =
        item.result ||
        item.status ||
        ''

      const matchesSearch =
        fileName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        defect
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesResult =
        resultFilter === 'ALL' ||
        result === resultFilter

      const matchesSeverity =
        severityFilter === 'ALL' ||
        severity === severityFilter

      return (
        matchesSearch &&
        matchesResult &&
        matchesSeverity
      )
    })
  }, [
    history,
    search,
    resultFilter,
    severityFilter,
  ])

  return (
    <Layout>
      <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <p className="text-blue-400 uppercase tracking-[0.3em] text-sm font-semibold">
              Quality Records
            </p>

            <h1 className="text-4xl font-bold mt-3">
              Inspection History
            </h1>

            <p className="text-gray-400 mt-3">
              Review previous AI-powered inspection results.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Total Inspections
              </p>

              <h2 className="text-3xl font-bold text-blue-400 mt-2">
                {total}
              </h2>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Passed
              </p>

              <h2 className="text-3xl font-bold text-green-400 mt-2">
                {passed}
              </h2>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Failed
              </p>

              <h2 className="text-3xl font-bold text-red-400 mt-2">
                {failed}
              </h2>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Critical Defects
              </p>

              <h2 className="text-3xl font-bold text-yellow-400 mt-2">
                {critical}
              </h2>
            </div>

          </div>

          {/* Filters */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">

            <div className="grid md:grid-cols-3 gap-4">

              <input
                type="text"
                placeholder="Search file or defect..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <select
                value={resultFilter}
                onChange={e => setResultFilter(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Results</option>
                <option value="PASS">Passed</option>
                <option value="FAIL">Failed</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Severity Levels</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

            </div>

          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
              <p className="text-blue-400">
                Loading inspection history...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-400">
              {error}
            </div>
          )}

          {/* History Table */}
          {!loading && !error && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

              {filteredHistory.length === 0 ? (
                <div className="p-16 text-center">

                  <div className="text-gray-600 text-5xl mb-5">
                    —
                  </div>

                  <h3 className="text-xl font-semibold text-gray-300">
                    No Inspection Records Available
                  </h3>

                  <p className="text-gray-500 mt-3 max-w-md mx-auto">
                    No inspection records were found for your account.
                  </p>

                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>
                      <tr className="bg-gray-800/70 text-gray-400 text-sm uppercase">

                        <th className="text-left px-6 py-4">
                          File
                        </th>

                        <th className="text-left px-6 py-4">
                          Defect
                        </th>

                        <th className="text-left px-6 py-4">
                          Severity
                        </th>

                        <th className="text-left px-6 py-4">
                          Score
                        </th>

                        <th className="text-left px-6 py-4">
                          Result
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-800">

                      {filteredHistory.map((item, index) => {

                        const severity =
                          item.severity?.level ||
                          item.severity ||
                          item.severity_level ||
                          'Unknown'

                        const score =
                          item.severity?.score ??
                          item.score ??
                          item.ai_score ??
                          '—'

                        const defect =
                          item.defect ||
                          item.defect_type ||
                          item.defectType ||
                          'Unknown'

                        const fileName =
                          item.file ||
                          item.filename ||
                          item.fileName ||
                          'Unknown'

                        const result =
                          item.result ||
                          item.status ||
                          'UNKNOWN'

                        return (
                          <tr
                            key={item.id || item.inspection_id || index}
                            className="hover:bg-gray-800/40 transition"
                          >

                            <td className="px-6 py-5 font-medium text-gray-200">
                              {fileName}
                            </td>

                            <td className="px-6 py-5 text-gray-300">
                              {defect}
                            </td>

                            <td className="px-6 py-5">
                              <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm">
                                {severity}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-gray-300">
                              {score}
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  result === 'PASS'
                                    ? 'bg-green-500/10 text-green-400'
                                    : result === 'FAIL'
                                    ? 'bg-red-500/10 text-red-400'
                                    : 'bg-blue-500/10 text-blue-400'
                                }`}
                              >
                                {result}
                              </span>
                            </td>

                          </tr>
                        )
                      })}

                    </tbody>

                  </table>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </Layout>
  )
}