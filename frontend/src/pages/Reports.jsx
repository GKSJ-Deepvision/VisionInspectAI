import { useState } from 'react'
import Layout from '../components/Layout.jsx'

export default function Reports() {
  const [reportType, setReportType] = useState('Inspection Summary')
  const [dateRange, setDateRange] = useState('All Time')

  // Real data will be connected from the backend later.
  const reportData = {
    total: 0,
    passed: 0,
    failed: 0,
    critical: 0,
  }

  const passRate =
    reportData.total > 0
      ? Math.round((reportData.passed / reportData.total) * 100)
      : 0

  function handleGenerateReport() {
    alert(
      'Report generation will be available once the inspection backend and database are connected.'
    )
  }

  function handleDownload() {
    alert(
      'Report download will be available once real inspection data is connected.'
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-950 text-white px-6 py-10">

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
                  onChange={e => setReportType(e.target.value)}
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
                  onChange={e => setDateRange(e.target.value)}
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
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition"
              >
                Generate Report
              </button>

              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 font-semibold transition"
              >
                Download Report
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

              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm">
                No Data
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

              <div className="mt-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">

                <p className="text-blue-400 font-semibold">
                  Waiting for Inspection Data
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  Reports will be automatically populated when real AI
                  inspection results are available from the backend.
                </p>

              </div>

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