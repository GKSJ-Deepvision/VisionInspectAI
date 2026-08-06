import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getInspectionHistory } from '../services/api.js'

const PAGE_SIZE = 50


function getDateCutoff(dateRange) {
  const now = new Date()

  switch (dateRange) {
    case 'Today': {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return start
    }
    case 'Last 7 Days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'Last 30 Days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case 'Last 3 Months':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

function toCSV(rows) {
  const header = [
    'Username', 'File', 'Category', 'Defect', 'Severity',
    'Score', 'Inspection Result', 'Quality Decision', 'Date',
  ]

  const lines = rows.map(r => [
    r.username, r.file, r.category, r.defect, r.severity,
    r.score, r.inspectionResult, r.qualityDecision, r.date,
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))

  return [header.join(','), ...lines].join('\n')
}

export default function History() {

  const { user } = useAuth()

  const [history, setHistory] = useState([])
  const [totalOnServer, setTotalOnServer] = useState(0)
  const [limit, setLimit] = useState(PAGE_SIZE)

  const [search, setSearch] = useState('')
  const [inspectionResultFilter, setInspectionResultFilter] = useState('ALL')
  const [qualityDecisionFilter, setQualityDecisionFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [dateRange, setDateRange] = useState('All Time')
  const [sortOrder, setSortOrder] = useState('newest')

  const [selectedInspector, setSelectedInspector] = useState(null)

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const isFactorySupervisor = user?.role === 'factory_supervisor'


  useEffect(() => {

    async function loadHistory() {

      if (!user?.token) {
        setError('Authentication token not found. Please login again.')
        setLoading(false)
        return
      }

      try {
        if (limit === PAGE_SIZE) {
          setLoading(true)
        } else {
          setLoadingMore(true)
        }
        setError('')

        const data = await getInspectionHistory(user.token, { limit })

        const records =
          Array.isArray(data)
            ? data
            : data.data?.results ||
              data.results ||
              data.history ||
              data.inspections ||
              []

        const total =
          data.data?.total ??
          data.total ??
          records.length

        setHistory(records)
        setTotalOnServer(total)

      } catch (err) {
        console.error('Failed to load history:', err)
        setError(err.message || 'Failed to load inspection history.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    }

    loadHistory()

  }, [user?.token, limit])



  const total = history.length

  const passed = history.filter(item => {
    const status = (item.status || '').toLowerCase()
    return status === 'normal' || status === 'pass'
  }).length

  const failed = history.filter(item => {
    const status = (item.status || '').toLowerCase()
    return status === 'defective' || status === 'fail'
  }).length

  const noDefect = history.filter(
    item => (item.severity_level || '') === 'Unknown'
  ).length




  const categoryOptions = useMemo(() => {
    const set = new Set()
    history.forEach(item => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set).sort()
  }, [history])


 

  const inspectors = useMemo(() => {
    if (!isFactorySupervisor) return []

    const grouped = {}

    history.forEach(item => {
      const username = item.username || 'Unknown Inspector'
      if (!grouped[username]) grouped[username] = []
      grouped[username].push(item)
    })

    return Object.entries(grouped)
      .map(([username, inspections]) => ({
        username,
        inspections,
        count: inspections.length,
      }))
      .sort((a, b) => a.username.localeCompare(b.username))

  }, [history, isFactorySupervisor])


  const filteredInspectors = useMemo(() => {
    return inspectors.filter(inspector =>
      inspector.username.toLowerCase().includes(search.toLowerCase())
    )
  }, [inspectors, search])


  const selectedInspectorHistory = useMemo(() => {
    if (!selectedInspector) return []
    return history.filter(
      item => (item.username || 'Unknown Inspector') === selectedInspector
    )
  }, [history, selectedInspector])




  const filteredHistory = useMemo(() => {
    const records = selectedInspector ? selectedInspectorHistory : history
    const cutoff = getDateCutoff(dateRange)

    const filtered = records.filter(item => {
      const fileName = item.filename || item.file_name || item.file || ''
      const defect = item.defect || item.defect_type || 'No Defect'
      const severity = item.severity_level || item.severity || 'Unknown'
      const category = item.category || ''

      const rawStatus = (
        item.inspection_result || item.inspectionResult || item.status || ''
      ).toLowerCase()

      let inspectionResult = 'Pending Review'
      if (rawStatus === 'normal' || rawStatus === 'pass' || rawStatus === 'passed') {
        inspectionResult = 'Pass'
      } else if (rawStatus === 'defective' || rawStatus === 'fail' || rawStatus === 'failed') {
        inspectionResult = 'Fail'
      }

      const qualityDecision = item.quality_decision || item.qualityDecision || ''

      const matchesSearch =
        fileName.toLowerCase().includes(search.toLowerCase()) ||
        defect.toLowerCase().includes(search.toLowerCase())

      const matchesInspectionResult =
        inspectionResultFilter === 'ALL' || inspectionResult === inspectionResultFilter

      const matchesQualityDecision =
        qualityDecisionFilter === 'ALL' || qualityDecision === qualityDecisionFilter

      const matchesSeverity =
        severityFilter === 'ALL' || severity === severityFilter

      const matchesCategory =
        categoryFilter === 'ALL' || category === categoryFilter

      const matchesDate =
        !cutoff || !item.created_at || new Date(item.created_at) >= cutoff

      return (
        matchesSearch &&
        matchesInspectionResult &&
        matchesQualityDecision &&
        matchesSeverity &&
        matchesCategory &&
        matchesDate
      )
    })

    return [...filtered].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

  }, [
    history,
    selectedInspectorHistory,
    selectedInspector,
    search,
    inspectionResultFilter,
    qualityDecisionFilter,
    severityFilter,
    categoryFilter,
    dateRange,
    sortOrder,
  ])


  const hasMore = history.length < totalOnServer


  function handleResetFilters() {
    setSearch('')
    setInspectionResultFilter('ALL')
    setQualityDecisionFilter('ALL')
    setSeverityFilter('ALL')
    setCategoryFilter('ALL')
    setDateRange('All Time')
    setSortOrder('newest')
  }

  function handleBackToInspectors() {
    setSelectedInspector(null)
    handleResetFilters()
  }

  function handleLoadMore() {
    setLimit(l => l + PAGE_SIZE)
  }

  function handleExportCSV() {
    if (filteredHistory.length === 0) {
      alert('No records to export for the current filters.')
      return
    }

    const rows = filteredHistory.map(item => {
      const rawStatus = (
        item.inspection_result || item.inspectionResult || item.status || ''
      ).toLowerCase()

      let inspectionResult = 'Pending Review'
      if (rawStatus === 'normal' || rawStatus === 'pass' || rawStatus === 'passed') {
        inspectionResult = 'Pass'
      } else if (rawStatus === 'defective' || rawStatus === 'fail' || rawStatus === 'failed') {
        inspectionResult = 'Fail'
      }

      return {
        username: item.username || 'Unknown',
        file: item.filename || item.file_name || item.file || 'Unknown',
        category: item.category || 'Unknown',
        defect: item.defect || item.defect_type || 'No Defect',
        severity: item.severity_level || item.severity || 'Unknown',
        score: item.score ?? item.anomaly_score ?? item.ai_score ?? '',
        inspectionResult,
        qualityDecision: item.quality_decision || item.qualityDecision || 'Manual Inspection',
        date: item.created_at || '',
      }
    })

    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `inspection_history_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }


  return (
    <Layout>
      <div className="min-h-screen text-white px-6 py-10">
        <div className="max-w-7xl mx-auto">

          {/* ==================================================
              FACTORY SUPERVISOR - INSPECTOR LIST
          ================================================== */}

          {isFactorySupervisor && !selectedInspector ? (
            <>
              <div className="mb-8">
                <p className="text-blue-400 uppercase tracking-[0.3em] text-sm font-semibold">
                  Quality Records
                </p>

                <h1 className="text-4xl font-bold mt-3">
                  Inspection History
                </h1>

                <p className="text-gray-400 mt-3">
                  View inspection records performed by all quality inspectors.
                </p>
              </div>

              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <p className="text-gray-400 text-sm">Total Inspections</p>
                  <h2 className="text-3xl font-bold text-blue-400 mt-2">{total}</h2>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <p className="text-gray-400 text-sm">Passed</p>
                  <h2 className="text-3xl font-bold text-green-400 mt-2">{passed}</h2>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <p className="text-gray-400 text-sm">Failed</p>
                  <h2 className="text-3xl font-bold text-red-400 mt-2">{failed}</h2>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <p className="text-gray-400 text-sm">No Defect</p>
                  <h2 className="text-3xl font-bold text-yellow-400 mt-2">{noDefect}</h2>
                </div>

              </div>

              {/* SEARCH INSPECTORS */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
                <input
                  type="text"
                  placeholder="Search inspectors..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {loading && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
                  <p className="text-blue-400">Loading inspection history...</p>
                </div>
              )}

              {!loading && error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-400">
                  {error}
                </div>
              )}

              {!loading && !error && (
                <>
                  {filteredInspectors.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
                      <h3 className="text-xl font-semibold text-gray-300">
                        No Inspectors Found
                      </h3>
                      <p className="text-gray-500 mt-3">
                        No inspector records match your search.
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredInspectors.map(inspector => (
                        <button
                          key={inspector.username}
                          onClick={() => setSelectedInspector(inspector.username)}
                          className="text-left bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 hover:bg-gray-800/60 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-400 text-sm">Quality Inspector</p>
                              <h2 className="text-xl font-bold text-white mt-2">
                                {inspector.username}
                              </h2>
                            </div>

                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                              <span className="text-blue-400 text-xl font-bold">
                                {inspector.count}
                              </span>
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-gray-800">
                            <p className="text-gray-400 text-sm">Total Inspections</p>
                            <p className="text-blue-400 font-semibold mt-1">
                              {inspector.count} inspection{inspector.count !== 1 ? 's' : ''}
                            </p>
                          </div>

                          <p className="text-gray-500 text-sm mt-4">
                            Click to view complete inspection history →
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {hasMore && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 rounded-xl text-gray-300 font-semibold transition"
                      >
                        {loadingMore ? 'Loading…' : `Load More (${history.length} of ${totalOnServer})`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (

            /* ==================================================
                DETAIL TABLE VIEW
            ================================================== */

            <>
              {isFactorySupervisor && selectedInspector && (
                <button
                  onClick={handleBackToInspectors}
                  className="mb-6 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition"
                >
                  ← Back to Inspectors
                </button>
              )}

              {/* HEADER */}
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-blue-400 uppercase tracking-[0.3em] text-sm font-semibold">
                    Quality Records
                  </p>

                  <h1 className="text-4xl font-bold mt-3">
                    {selectedInspector ? `${selectedInspector}'s Inspection History` : 'Inspection History'}
                  </h1>

                  <p className="text-gray-400 mt-3">
                    Review previous AI-powered inspection results.
                  </p>
                </div>

                <button
                  onClick={handleExportCSV}
                  disabled={loading}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-white font-semibold transition whitespace-nowrap"
                >
                  Export CSV
                </button>
              </div>

              {/* SUMMARY CARDS (only shown for non-supervisor, since supervisor already saw them above) */}
              {!isFactorySupervisor && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Total Inspections</p>
                    <h2 className="text-3xl font-bold text-blue-400 mt-2">{total}</h2>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Passed</p>
                    <h2 className="text-3xl font-bold text-green-400 mt-2">{passed}</h2>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Failed</p>
                    <h2 className="text-3xl font-bold text-red-400 mt-2">{failed}</h2>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">No Defect</p>
                    <h2 className="text-3xl font-bold text-yellow-400 mt-2">{noDefect}</h2>
                  </div>
                </div>
              )}

              {/* FILTERS */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">

                  <input
                    type="text"
                    placeholder="Search file or defect..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />

                  <select
                    value={inspectionResultFilter}
                    onChange={e => setInspectionResultFilter(e.target.value)}
                    className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Inspection Results</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                    <option value="Pending Review">Pending Review</option>
                  </select>

                  <select
                    value={qualityDecisionFilter}
                    onChange={e => setQualityDecisionFilter(e.target.value)}
                    className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Quality Decisions</option>
                    <option value="Manual Inspection">Manual Inspection</option>
                    <option value="Rework">Rework</option>
                    <option value="Reject">Reject</option>
                    <option value="Accept">Accept</option>
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
                    <option value="Unknown">No Defect</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Categories</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </option>
                    ))}
                  </select>

                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option>All Time</option>
                    <option>Today</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 3 Months</option>
                  </select>

                  <select
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                    className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>

                  <button
                    onClick={handleResetFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 transition"
                  >
                    Reset Filters
                  </button>

                </div>
              </div>

              {loading && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
                  <p className="text-blue-400">Loading inspection history...</p>
                </div>
              )}

              {!loading && error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-400">
                  {error}
                </div>
              )}

              {/* TABLE */}
              {!loading && !error && (
                <>
                  {filteredHistory.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
                      <h3 className="text-xl font-semibold text-gray-300">
                        No Inspection Records Found
                      </h3>
                      <p className="text-gray-500 mt-3 max-w-md mx-auto">
                        No records match the current filters. Try adjusting or resetting them.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-5 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-3 text-sm text-gray-500 border-b border-gray-800">
                        <span>
                          Showing {filteredHistory.length} of {history.length} loaded record{history.length === 1 ? '' : 's'}
                          {hasMore ? ` (${totalOnServer} total)` : ''}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-800/70 text-gray-400 text-sm uppercase">
                              {isFactorySupervisor && (
                                <th className="px-6 py-4 text-left">Username</th>
                              )}
                              <th className="px-6 py-4 text-left">File</th>
                              <th className="px-6 py-4 text-left">Category</th>
                              <th className="px-6 py-4 text-left">Defect</th>
                              <th className="px-6 py-4 text-left">Severity</th>
                              <th className="px-6 py-4 text-left">Score</th>
                              <th className="px-6 py-4 text-left">Inspection Result</th>
                              <th className="px-6 py-4 text-left">Quality Decision</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-800">
                            {filteredHistory.map((item, index) => {
                              const rawStatus = (
                                item.inspection_result || item.inspectionResult || item.status || ''
                              ).toLowerCase()

                              let inspectionResult = 'Pending Review'
                              if (rawStatus === 'normal' || rawStatus === 'pass' || rawStatus === 'passed') {
                                inspectionResult = 'Pass'
                              } else if (rawStatus === 'defective' || rawStatus === 'fail' || rawStatus === 'failed') {
                                inspectionResult = 'Fail'
                              }

                              const qualityDecision =
                                item.quality_decision || item.qualityDecision || 'Manual Inspection'

                              const severity = item.severity_level || item.severity || 'Unknown'

                              const rawDefect = item.defect || item.defect_type || 'No Defect'
                              const defect =
                                rawDefect.charAt(0).toUpperCase() + rawDefect.slice(1).toLowerCase()

                              const category = item.category
                                ? item.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                                : '—'

                              const originalFileName =
                                item.filename || item.file_name || item.file || 'Unknown'

                              const fileName = originalFileName.includes('_')
                                ? originalFileName.split('_').slice(-1)[0]
                                : originalFileName

                              const score = item.score ?? item.anomaly_score ?? item.ai_score ?? '—'

                              return (
                                <tr key={item.id || index} className="hover:bg-gray-800/40">
                                  {isFactorySupervisor && (
                                    <td className="px-6 py-5 text-blue-400">
                                      {item.username || 'Unknown'}
                                    </td>
                                  )}

                                  <td className="px-6 py-5">{fileName}</td>

                                  <td className="px-6 py-5 text-gray-300">{category}</td>

                                  <td className="px-6 py-5">{defect}</td>

                                  <td className="px-6 py-5">
                                    <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm">
                                      {severity}
                                    </span>
                                  </td>

                                  <td className="px-6 py-5">
                                    {typeof score === 'number' ? score.toFixed(2) : score}
                                  </td>

                                  <td className="px-6 py-5">
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm ${
                                        inspectionResult === 'Pass'
                                          ? 'bg-green-500/10 text-green-400'
                                          : inspectionResult === 'Fail'
                                          ? 'bg-red-500/10 text-red-400'
                                          : 'bg-blue-500/10 text-blue-400'
                                      }`}
                                    >
                                      {inspectionResult}
                                    </span>
                                  </td>

                                  <td className="px-6 py-5">
                                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm">
                                      {qualityDecision}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {hasMore && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 rounded-xl text-gray-300 font-semibold transition"
                      >
                        {loadingMore ? 'Loading…' : `Load More (${history.length} of ${totalOnServer})`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </Layout>
  )
}
