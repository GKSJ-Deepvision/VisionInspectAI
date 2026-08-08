import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getReports, exportReportsCSV } from '../services/api.js'


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


function toDateParam(date) {
  if (!date) return null
  return date.toISOString().slice(0, 10)
}

export default function Reports() {

  const { user } = useAuth()

  const token = user?.token

  const [reportType, setReportType] = useState('Inspection Summary')
  const [dateRange, setDateRange] = useState('All Time')

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)
  const [downloading, setDownloading] = useState(false)


  useEffect(() => {

    async function loadReports() {

      if (!token) {
        setError('Authentication token not found. Please login again.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await getReports(token)

        const rows = response?.data?.records || response?.records || []

        setRecords(rows)

      } catch (err) {
        console.error('REPORT ERROR:', err)
        setError(err.message || 'Failed to load reports.')
      } finally {
        setLoading(false)
      }
    }

    loadReports()

  }, [token])


  const filteredRecords = useMemo(() => {
    const cutoff = getDateCutoff(dateRange)

    if (!cutoff) return records

    return records.filter(item => {
      if (!item.report_date) return true
      return new Date(item.report_date) >= cutoff
    })
  }, [records, dateRange])


  const reportData = useMemo(() => {
    const total = filteredRecords.reduce(
      (sum, item) => sum + (item.total_inspections || 0), 0
    )

    const passed = filteredRecords.reduce(
      (sum, item) => sum + (item.pass_count || 0), 0
    )

    const failed = filteredRecords.reduce(
      (sum, item) => sum + (item.fail_count || 0), 0
    )

    const critical = filteredRecords.reduce(
      (sum, item) => sum + (item.total_defects || 0), 0
    )

    return { total, passed, failed, critical }
  }, [filteredRecords])

  const hasData = reportData.total > 0

  const passRate =
    reportData.total > 0
      ? Math.round((reportData.passed / reportData.total) * 100)
      : 0


  function handleGenerateReport() {
    setGenerated(true)
  }


  async function handleDownload() {

    if (!token) {
      alert('Authentication token not found. Please login again.')
      return
    }

    try {
      setDownloading(true)

      const filters = {}

      const cutoff = getDateCutoff(dateRange)
      if (cutoff) {
        filters.date_from = toDateParam(cutoff)
      }


      if (reportType === 'Defect Analysis') {
        filters.status = 'Defective'
      }

      const blob = await exportReportsCSV(token, filters)

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportType.replace(/\s+/g, '_').toLowerCase()}_${dateRange.replace(/\s+/g, '_').toLowerCase()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (err) {
      console.error('REPORT DOWNLOAD ERROR:', err)
      alert(err.message || 'Failed to download report.')
    } finally {
      setDownloading(false)
    }
  }


  return (
    <Layout>
      <div className="min-h-screen text-white px-6 py-10">

        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-10">

            <p className="text-blue-400 uppercase tracking-[0.3em] text-sm font-semibold">
              Quality Documentation
            </p>

            <h1 className="text-4xl font-bold mt-3">
              Inspection Reports
            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Generate and download detailed quality inspection reports.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-400">
              {error}
            </div>
          )}

          {/* Report Controls */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 mb-8">

            <h2 className="text-xl font-semibold">
              Generate Report
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Select the report type and time period.
            </p>

            <div className="grid md:grid-cols-2 gap-5 mt-6">

              {/* Report Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Report Type
                </label>

                <select
                  value={reportType}
                  onChange={e => { setReportType(e.target.value); setGenerated(false) }}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option>Inspection Summary</option>
                  <option>Defect Analysis</option>
                  <option>Quality Performance</option>
                  <option>Complete Inspection Report</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Date Range
                </label>

                <select
                  value={dateRange}
                  onChange={e => { setDateRange(e.target.value); setGenerated(false) }}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option>All Time</option>
                  <option>Today</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                </select>
              </div>

            </div>

            <div className="flex gap-4 mt-6">

              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition"
              >
                {loading ? 'Loading Data…' : 'Generate Report'}
              </button>

              <button
                onClick={handleDownload}
                disabled={loading || downloading}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-gray-300 font-semibold transition"
              >
                {downloading ? 'Downloading…' : 'Download Report'}
              </button>

            </div>

          </div>

          {/* Report Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 mb-8">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-semibold">
                  Report Summary
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  {reportType} • {dateRange}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  hasData
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}
              >
                {loading ? 'Loading…' : hasData ? 'Data Loaded' : 'No Data'}
              </span>

            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-500 text-sm">
                  Total Inspections
                </p>

                <h3 className="text-3xl font-bold text-blue-400 mt-2">
                  {reportData.total}
                </h3>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-500 text-sm">
                  Passed
                </p>

                <h3 className="text-3xl font-bold text-green-400 mt-2">
                  {reportData.passed}
                </h3>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-500 text-sm">
                  Failed
                </p>

                <h3 className="text-3xl font-bold text-red-400 mt-2">
                  {reportData.failed}
                </h3>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-500 text-sm">
                  Critical Defects
                </p>

                <h3 className="text-3xl font-bold text-yellow-400 mt-2">
                  {reportData.critical}
                </h3>
              </div>

            </div>

          </div>

          {/* Generated report preview (day-by-day breakdown) */}
          {generated && (
            <div className="bg-gray-900 border border-blue-500/30 rounded-2xl p-7 mb-8">

              <h2 className="text-xl font-semibold text-blue-400">
                Generated: {reportType}
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                {dateRange} • {filteredRecords.length} day{filteredRecords.length === 1 ? '' : 's'} of data
              </p>

              {hasData ? (
                <div className="overflow-x-auto mt-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-800/70 text-gray-400 uppercase">
                        <th className="text-left px-4 py-3">Date</th>
                        <th className="text-left px-4 py-3">Total</th>
                        <th className="text-left px-4 py-3">Passed</th>
                        <th className="text-left px-4 py-3">Failed</th>
                        <th className="text-left px-4 py-3">Defects</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredRecords.map((item, idx) => (
                        <tr key={item.id || item.report_date || idx}>
                          <td className="px-4 py-3 text-gray-200">{item.report_date || '—'}</td>
                          <td className="px-4 py-3 text-gray-300">{item.total_inspections || 0}</td>
                          <td className="px-4 py-3 text-green-400">{item.pass_count || 0}</td>
                          <td className="px-4 py-3 text-red-400">{item.fail_count || 0}</td>
                          <td className="px-4 py-3 text-yellow-400">{item.total_defects || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 mt-4">
                  No inspection records match this report type and date range yet.
                </p>
              )}

            </div>
          )}

          {/* Quality Overview */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Pass Rate */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7">

              <h2 className="text-xl font-semibold">
                Quality Performance
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Overall inspection pass rate.
              </p>

              <div className="mt-8">

                <div className="flex justify-between mb-3">

                  <span className="text-gray-400">
                    Pass Rate
                  </span>

                  <span className="text-green-400 font-semibold">
                    {passRate}%
                  </span>

                </div>

                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${passRate}%`
                    }}
                  />

                </div>

              </div>

            </div>

            {/* Report Status */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7">

              <h2 className="text-xl font-semibold">
                Report Status
              </h2>

              {hasData ? (
                <div className="mt-6 bg-green-500/5 border border-green-500/20 rounded-xl p-5">
                  <p className="text-green-400 font-semibold">
                    Inspection Data Connected
                  </p>

                  <p className="text-gray-500 text-sm mt-2">
                    Showing {reportData.total} inspection{reportData.total === 1 ? '' : 's'} across {filteredRecords.length} day{filteredRecords.length === 1 ? '' : 's'} from the AI inspection database.
                  </p>
                </div>
              ) : (
                <div className="mt-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
                  <p className="text-blue-400 font-semibold">
                    {loading ? 'Loading Inspection Data…' : 'Waiting for Inspection Data'}
                  </p>

                  <p className="text-gray-500 text-sm mt-2">
                    {loading
                      ? 'Fetching results from the backend.'
                      : 'No inspection records were found for the selected filters.'}
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* Information */}
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-7">

            <h2 className="text-xl font-semibold">
              Report Information
            </h2>

            <div className="grid md:grid-cols-3 gap-5 mt-6">

              <div>
                <p className="text-gray-500 text-sm">
                  Report Type
                </p>

                <p className="text-gray-300 mt-1">
                  {reportType}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Date Range
                </p>

                <p className="text-gray-300 mt-1">
                  {dateRange}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Data Source
                </p>

                <p className="text-gray-300 mt-1">
                  AI Inspection Database
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </Layout>
  )
}
