import { useMemo } from 'react'
import Layout from '../components/Layout.jsx'

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

  // Real inspection data will be connected
  // from the backend later.
  // For now, keep analytics data empty.
  const history = []

  const analytics = useMemo(() => {

    const total = history.length

    const passed = history.filter(
      item => item.result === 'PASS'
    ).length

    const failed = history.filter(
      item => item.result === 'FAIL'
    ).length

    const critical = history.filter(
      item => item.severity?.level === 'Critical'
    ).length

    const passRate =
      total > 0
        ? Math.round((passed / total) * 100)
        : 0

    const defectCounts = {}

    history.forEach(item => {

      const defect =
        item.defect ||
        item.defect_type ||
        item.defectType ||
        'Unknown'

      defectCounts[defect] =
        (defectCounts[defect] || 0) + 1

    })

    const topDefects = Object.entries(defectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      total,
      passed,
      failed,
      critical,
      passRate,
      topDefects
    }

  }, [history])

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
              value={analytics.total}
              description="Total components inspected"
              icon="📊"
            />

            <MetricCard
              title="Pass Rate"
              value={`${analytics.passRate}%`}
              description="Overall inspection pass rate"
              icon="✓"
            />

            <MetricCard
              title="Failed Inspections"
              value={analytics.failed}
              description="Components requiring attention"
              icon="!"
            />

            <MetricCard
              title="Critical Defects"
              value={analytics.critical}
              description="High-priority quality issues"
              icon="⚠"
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

              <div className="mt-8">

                <div className="flex justify-between mb-3">
                  <span className="text-gray-400">
                    Passed
                  </span>

                  <span className="text-green-400 font-semibold">
                    {analytics.passed}
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${analytics.passRate}%`
                    }}
                  />

                </div>

              </div>

              <div className="mt-7">

                <div className="flex justify-between mb-3">
                  <span className="text-gray-400">
                    Failed
                  </span>

                  <span className="text-red-400 font-semibold">
                    {analytics.failed}
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{
                      width:
                        analytics.total > 0
                          ? `${(analytics.failed / analytics.total) * 100}%`
                          : '0%'
                    }}
                  />

                </div>

              </div>

            </div>

            {/* Common Defects */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7">

              <h2 className="text-xl font-semibold">
                Common Defects
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Most frequently detected defect types.
              </p>

              <div className="mt-6">

                {analytics.topDefects.length === 0 ? (

                  <div className="text-gray-500 py-8 text-center">
                    No defect data available yet.
                  </div>

                ) : (

                  <div className="space-y-4">

                    {analytics.topDefects.map(
                      ([defect, count], index) => (

                        <div
                          key={defect}
                          className="flex items-center justify-between bg-gray-950 rounded-lg px-4 py-3"
                        >

                          <div className="flex items-center gap-3">

                            <span className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm">
                              {index + 1}
                            </span>

                            <span className="text-gray-300">
                              {defect}
                            </span>

                          </div>

                          <span className="text-white font-semibold">
                            {count}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

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

          {/* No Data Notice */}
          <div className="mt-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 text-center">

            <h3 className="text-lg font-semibold text-blue-300">
              Analytics Data Not Available Yet
            </h3>

            <p className="text-gray-500 mt-2">
              Analytics will be populated automatically once the AI inspection
              service and backend database are connected.
            </p>

          </div>

        </div>

      </div>
    </Layout>
  )
}