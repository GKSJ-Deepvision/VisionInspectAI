import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAnalytics,
  getAnalyticsByStatus,
} from '../services/api.js'

function MetricCard({ title, value, description, icon }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/40 transition">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-gray-400 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-white mt-2">
            {value}
          </h2>
        </div>

        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
          {icon}
        </div>

      </div>

      <p className="text-gray-500 text-sm mt-4">
        {description}
      </p>

    </div>
  )
}

export default function Analytics() {

  const { user } = useAuth()

  const [analyticsData, setAnalyticsData] = useState(null)
  const [statusData, setStatusData] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load analytics data from backend
  useEffect(() => {

    async function loadAnalytics() {

      if (!user?.token) {
        setError('Authentication token not found. Please login again.')
        setLoading(false)
        return
      }

      try {

        setLoading(true)
        setError('')

        const [analytics, byStatus] = await Promise.all([
          getAnalytics(user.token),
          getAnalyticsByStatus(user.token),
        ])

        console.log('Analytics API response:', analytics)
        console.log('Analytics by status response:', byStatus)

        setAnalyticsData(analytics)
        setStatusData(byStatus)

      } catch (err) {

        console.error('Analytics error:', err)

        setError(
          err.message || 'Failed to load analytics'
        )

      } finally {

        setLoading(false)

      }
    }

    loadAnalytics()

  }, [user?.token])


  // Extract summary data from backend response
  const summary = analyticsData?.summary || {}

  const total = summary.total_inspections || 0

  const averageScore =
    summary.average_score || 0

  const maxScore =
    summary.max_score || 0

  const minScore =
    summary.min_score || 0


  // Extract status data from backend response
  const statusList =
    statusData?.by_status || []

  const passed =
    statusList.find(
      item => item.status === 'PASS'
    )?.count || 0

  const failed =
    statusList.find(
      item => item.status === 'FAIL'
    )?.count || 0


  const passRate =
    total > 0
      ? Math.round((passed / total) * 100)
      : 0


  // Loading state
  if (loading) {
    return (
      <Layout>

        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">

          <div className="text-center">

            <div className="text-blue-400 text-xl font-semibold">
              Loading Analytics...
            </div>

            <p className="text-gray-500 mt-2">
              Fetching inspection analytics from the backend.
            </p>

          </div>

        </div>

      </Layout>
    )
  }


  // Error state
  if (error) {
    return (
      <Layout>

        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">

          <div className="max-w-7xl mx-auto">

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">

              <h2 className="text-xl font-semibold text-red-400">
                Failed to Load Analytics
              </h2>

              <p className="text-gray-400 mt-2">
                {error}
              </p>

            </div>

          </div>

        </div>

      </Layout>
    )
  }


  return (
    <Layout>

      <div className="min-h-screen bg-gray-950 text-white px-6 py-10">

        <div className="max-w-7xl mx-auto">


          {/* Header */}
          <div className="mb-10">

            <p className="text-blue-400 uppercase tracking-[0.3em] text-sm font-semibold">
              Quality Intelligence
            </p>

            <h1 className="text-4xl font-bold mt-3">
              Analytics Dashboard
            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Monitor inspection performance and identify quality trends.
            </p>

          </div>


          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

            <MetricCard
              title="Total Inspections"
              value={total}
              description="Total components inspected"
              icon="📊"
            />

            <MetricCard
              title="Pass Rate"
              value={`${passRate}%`}
              description="Overall inspection pass rate"
              icon="✓"
            />

            <MetricCard
              title="Failed Inspections"
              value={failed}
              description="Components requiring attention"
              icon="!"
            />

            <MetricCard
              title="Average AI Score"
              value={averageScore}
              description="Average inspection AI score"
              icon="⚡"
            />

          </div>


          {/* Main Analytics */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">


            {/* Inspection Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7">

              <h2 className="text-xl font-semibold">
                Inspection Summary
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Overview of passed and failed inspections.
              </p>


              {/* Passed */}
              <div className="mt-8">

                <div className="flex justify-between mb-3">

                  <span className="text-gray-400">
                    Passed
                  </span>

                  <span className="text-green-400 font-semibold">
                    {passed}
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


              {/* Failed */}
              <div className="mt-7">

                <div className="flex justify-between mb-3">

                  <span className="text-gray-400">
                    Failed
                  </span>

                  <span className="text-red-400 font-semibold">
                    {failed}
                  </span>

                </div>


                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{
                      width:
                        total > 0
                          ? `${(failed / total) * 100}%`
                          : '0%'
                    }}
                  />

                </div>

              </div>

            </div>


            {/* Score Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7">

              <h2 className="text-xl font-semibold">
                AI Score Summary
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Inspection AI score statistics from the backend.
              </p>


              <div className="mt-7 space-y-5">


                <div className="flex justify-between items-center bg-gray-950 rounded-xl p-4">

                  <span className="text-gray-400">
                    Average Score
                  </span>

                  <span className="text-blue-400 text-xl font-semibold">
                    {averageScore}
                  </span>

                </div>


                <div className="flex justify-between items-center bg-gray-950 rounded-xl p-4">

                  <span className="text-gray-400">
                    Maximum Score
                  </span>

                  <span className="text-green-400 text-xl font-semibold">
                    {maxScore}
                  </span>

                </div>


                <div className="flex justify-between items-center bg-gray-950 rounded-xl p-4">

                  <span className="text-gray-400">
                    Minimum Score
                  </span>

                  <span className="text-yellow-400 text-xl font-semibold">
                    {minScore}
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* Quality Status */}
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-7">

            <h2 className="text-xl font-semibold">
              Quality Status
            </h2>

            <div className="grid md:grid-cols-3 gap-5 mt-6">


              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">

                <p className="text-green-400 font-semibold">
                  Good Quality
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  Passed components are within acceptable quality limits.
                </p>

              </div>


              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">

                <p className="text-yellow-400 font-semibold">
                  Monitor
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  Review medium and high severity defects regularly.
                </p>

              </div>


              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">

                <p className="text-red-400 font-semibold">
                  Critical Attention
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  Critical defects should be reviewed by the quality team.
                </p>

              </div>

            </div>

          </div>


          {/* Backend Data Status */}
          <div className="mt-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 text-center">

            <h3 className="text-lg font-semibold text-blue-300">
              Analytics Connected
            </h3>

            <p className="text-gray-500 mt-2">
              Analytics data is being loaded directly from the backend API.
            </p>

          </div>


        </div>

      </div>

    </Layout>
  )
}