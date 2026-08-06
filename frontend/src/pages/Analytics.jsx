import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAnalytics,
  getAnalyticsByStatus,
} from '../services/api.js'

function MetricCard({ title, value, description, icon }) {
  return (
    <div className="group bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-lg shadow-black/10 hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300">

      <div className="flex items-center justify-between gap-4">

        <div className="min-w-0">
          <p className="text-gray-400 text-sm font-medium">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-white mt-2 truncate">
            {value}
          </h2>
        </div>

        <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/10 text-blue-400 flex items-center justify-center text-xl group-hover:bg-blue-500/20 transition">
          {icon}
        </div>

      </div>

      <p className="text-gray-500 text-sm mt-4">
        {description}
      </p>

    </div>
  )
}


function ChartPlaceholder({ title, description, icon }) {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 min-h-[320px] flex flex-col shadow-lg shadow-black/10 hover:border-blue-500/30 transition-all duration-300">

      <div className="flex items-start justify-between gap-4">

        <div>
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>

          <p className="text-gray-500 text-sm mt-2">
            {description}
          </p>
        </div>

        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
          {icon}
        </div>

      </div>


      <div className="flex-1 flex items-center justify-center">

        <div className="text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-800/70 border border-gray-700 flex items-center justify-center text-2xl">
            📊
          </div>

          <p className="text-gray-400 font-medium mt-4">
            Chart data will appear here
          </p>

          <p className="text-gray-600 text-sm mt-2 max-w-xs mx-auto">
            Waiting for the analytics backend to provide this data.
          </p>

        </div>

      </div>

    </div>
  )
}

function AnalyticsChart({ title, data, dataKey, nameKey, type = "bar" }) {

  const chartColors = [
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#06b6d4",
]

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-lg">

      <h3 className="text-lg font-semibold text-white mb-5">
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={280}>

        {
          type === "pie" ? (

            <PieChart>

             <Pie
             data={data}
             dataKey={dataKey}
             nameKey={nameKey}
             cx="50%"
             cy="50%"
             outerRadius={90}
              label
>

                {
               data.map((entry, index) => (
               <Cell
               key={index}
              fill={chartColors[index % chartColors.length]}
               />
                  ))
                }

              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>

          ) : (

            <BarChart data={data}>

              <CartesianGrid
                stroke="#374151"
                strokeDasharray="3 3"
              />

             <XAxis
               dataKey={nameKey}
               stroke="#9ca3af"
            />

            <YAxis
             stroke="#9ca3af"
            />

              <Tooltip />

              <Legend />

              <Bar
              dataKey={dataKey}
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              />

            </BarChart>

          )
        }

      </ResponsiveContainer>

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
  const analytics = analyticsData?.data || {}

  const summary = analytics.summary || {}

  const statusChartData =
  analytics.by_status || []

const severityChartData =
  analytics.by_severity || []

const categoryChartData =
  analytics.by_category || []

const qualityDecisionChartData =
  analytics.by_quality_decision || []

  const total = summary.total_inspections || 0

  const averageScore =
    summary.average_score || 0

  const maxScore =
    summary.max_score || 0

  const minScore =
    summary.min_score || 0


  // Extract status data from backend response
  
const statusList =
  statusData?.data?.by_status || []

 const normal =
  statusList.find(
    item => item.status === 'Normal'
  )?.count || 0


const defective =
  statusList.find(
    item => item.status === 'Defective'
  )?.count || 0


  const qualityRate =
  total > 0
    ? Math.round((normal / total) * 100)
    : 0

  // Loading state
  if (loading) {
    return (
      <Layout>

        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">

          <div className="text-center">

            <div className="w-14 h-14 mx-auto rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin" />

            <h2 className="text-xl font-semibold mt-6">
              Loading Analytics
            </h2>

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

        <div className="min-h-screen text-white px-6 py-10">

          <div className="max-w-7xl mx-auto">

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center text-xl shrink-0">
                  !
                </div>

                <div>

                  <h2 className="text-xl font-semibold text-red-400">
                    Failed to Load Analytics
                  </h2>

                  <p className="text-gray-400 mt-2">
                    {error}
                  </p>

                  <p className="text-gray-600 text-sm mt-3">
                    Please make sure the backend server and analytics API are available.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </Layout>
    )
  }


  return (
    <Layout>

      <div className="min-h-screen text-white px-4 sm:px-6 py-8 sm:py-10">

        <div className="max-w-7xl mx-auto">


          {/* Header */}
          <div className="mb-8 sm:mb-10">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

              <div>

                <p className="text-blue-400 uppercase tracking-[0.25em] text-xs sm:text-sm font-semibold">
                  Quality Intelligence
                </p>

                <h1 className="text-3xl sm:text-4xl font-bold mt-3 tracking-tight">
                  Analytics Dashboard
                </h1>

                <p className="text-gray-400 mt-3 text-base sm:text-lg max-w-2xl">
                  Monitor inspection performance and identify quality trends across your inspections.
                </p>

              </div>


              <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 w-fit">

                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />

                <span className="text-gray-400 text-sm">
                  Analytics Overview
                </span>

              </div>

            </div>

          </div>


          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

            <MetricCard
              title="Total Inspections"
              value={total}
              description="Total components inspected"
              icon="📊"
            />

            <MetricCard
              title="Pass Rate"
              value={`${qualityRate}%`}
              description="Overall inspection pass rate"
              icon="✓"
            />

            <MetricCard
              title="Failed Inspections"
              value={defective}
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
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-7 shadow-lg shadow-black/10">

              <div>
                <h2 className="text-xl font-semibold">
                  Inspection Summary
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  Overview of passed and failed inspections.
                </p>
              </div>


              {/* Passed */}
              <div className="mt-8">

                <div className="flex justify-between mb-3">

                  <span className="text-gray-400">
                    Passed
                  </span>

                  <span className="text-green-400 font-semibold">
                    {normal}
                  </span>

                </div>


                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${qualityRate}%`
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
                    {defective}
                  </span>

                </div>


                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-700"
                    style={{
                      width:
                        total > 0
                          ? `${(defective / total) * 100}%`
                          : '0%'
                    }}
                  />

                </div>

              </div>

            </div>


            {/* Score Summary */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-7 shadow-lg shadow-black/10">

              <h2 className="text-xl font-semibold">
                AI Score Summary
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Inspection AI score statistics from the analytics data.
              </p>


              <div className="mt-7 space-y-4">

                <div className="flex justify-between items-center bg-gray-950/80 border border-gray-800 rounded-xl p-4">
                  <span className="text-gray-400">
                    Average Score
                  </span>

                  <span className="text-blue-400 text-xl font-semibold">
                    {averageScore}
                  </span>
                </div>


                <div className="flex justify-between items-center bg-gray-950/80 border border-gray-800 rounded-xl p-4">
                  <span className="text-gray-400">
                    Maximum Score
                  </span>

                  <span className="text-green-400 text-xl font-semibold">
                    {maxScore}
                  </span>
                </div>


                <div className="flex justify-between items-center bg-gray-950/80 border border-gray-800 rounded-xl p-4">
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


          {/* Charts Section */}
          <div className="mt-10">

            <div className="mb-6">

              <h2 className="text-2xl font-bold">
                Quality Analytics
              </h2>

              <p className="text-gray-500 mt-2">
                Visual insights into inspection status, severity, category, and quality decisions.
              </p>

            </div>


           <div className="grid lg:grid-cols-2 gap-6">


<AnalyticsChart
  title="Status-wise Statistics"
  data={statusChartData}
  dataKey="count"
  nameKey="status"
  type="pie"
/>


<AnalyticsChart
  title="Severity-wise Statistics"
  data={severityChartData}
  dataKey="count"
  nameKey="severity_level"
/>


<AnalyticsChart
  title="Category-wise Statistics"
  data={categoryChartData}
  dataKey="count"
  nameKey="category"
/>


<AnalyticsChart
  title="Quality Decision-wise Statistics"
  data={qualityDecisionChartData}
  dataKey="count"
  nameKey="quality_decision"
/>


</div>

          </div>


          {/* Quality Status */}
          <div className="mt-10 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-7 shadow-lg shadow-black/10">

            <div>

              <h2 className="text-xl font-semibold">
                Quality Status
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                General quality guidance for inspection results.
              </p>

            </div>


            <div className="grid md:grid-cols-3 gap-5 mt-6">


              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 hover:border-green-500/40 transition">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
                    ✓
                  </div>

                  <p className="text-green-400 font-semibold">
                    Good Quality
                  </p>

                </div>

                <p className="text-gray-500 text-sm mt-3">
                  Passed components are within acceptable quality limits.
                </p>

              </div>


              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 hover:border-yellow-500/40 transition">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                    !
                  </div>

                  <p className="text-yellow-400 font-semibold">
                    Monitor
                  </p>

                </div>

                <p className="text-gray-500 text-sm mt-3">
                  Review medium and high severity defects regularly.
                </p>

              </div>


              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 hover:border-red-500/40 transition">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                    !
                  </div>

                  <p className="text-red-400 font-semibold">
                    Critical Attention
                  </p>

                </div>

                <p className="text-gray-500 text-sm mt-3">
                  Critical defects should be reviewed by the quality team.
                </p>

              </div>

            </div>

          </div>



        </div>

      </div>

    </Layout>
  )
}

