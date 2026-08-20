import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

import {
  Factory,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  BarChart3,
  Clock,
  TriangleAlert,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

function SupervisorDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    defects: 0,
    no_defects: 0,
    critical: 0,
    moderate: 0,
    minor: 0,
    average_confidence: 0,
    quality_score: 0,
    production_status: "No Data",
    overall_risk: "No Data",
    trend: [],
    outcome_trend: [],
    recent: [],
  });

  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH SUPERVISOR DASHBOARD
  // =========================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const username = localStorage.getItem("username") || "";
      const role = localStorage.getItem("role") || "";

      console.log("Supervisor Dashboard User:", username);
      console.log("Supervisor Dashboard Role:", role);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/dashboard`,
        {
          params: {
            username,
            role,
          },
        }
      );

      console.log("Supervisor Dashboard Response:", res.data);

      setStats({
        total: res.data?.total ?? 0,
        defects: res.data?.defects ?? 0,
        no_defects: res.data?.no_defects ?? 0,
        critical: res.data?.critical ?? 0,
        moderate: res.data?.moderate ?? 0,
        minor: res.data?.minor ?? 0,
        average_confidence:
          res.data?.average_confidence ?? 0,
        quality_score:
          res.data?.quality_score ?? 0,
        production_status:
          res.data?.production_status || "No Data",
        overall_risk:
          res.data?.overall_risk || "No Data",
        trend:
          Array.isArray(res.data?.trend)
            ? res.data.trend
            : [],
        outcome_trend:
          Array.isArray(res.data?.outcome_trend)
            ? res.data.outcome_trend
            : [],
        recent:
          Array.isArray(res.data?.recent)
            ? res.data.recent
            : [],
      });
    } catch (error) {
      console.error("Supervisor Dashboard error:", error);

      setStats({
        total: 0,
        defects: 0,
        no_defects: 0,
        critical: 0,
        moderate: 0,
        minor: 0,
        average_confidence: 0,
        quality_score: 0,
        production_status: "No Data",
        overall_risk: "No Data",
        trend: [],
        outcome_trend: [],
        recent: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CHART DATA
  // =========================================================

  const defectData = [
    {
      name: "Defective",
      value: stats.defects,
    },
    {
      name: "No Defect",
      value: stats.no_defects,
    },
  ];

  const severityData = [
    {
      name: "High",
      count: stats.critical,
    },
    {
      name: "Medium",
      count: stats.moderate,
    },
    {
      name: "Low",
      count: stats.minor,
    },
  ];

  const COLORS = ["#EF4444", "#22C55E"];

  // =========================================================
  // RECOMMENDATIONS
  // =========================================================

  const recommendations = [];

  if (stats.total === 0) {
    recommendations.push({
      type: "info",
      text:
        "No inspection data is available yet. Quality Engineers need to complete inspections to generate factory quality insights.",
    });
  } else {
    if (stats.critical > 0) {
      recommendations.push({
        type: "warning",
        text: `${stats.critical} high-severity defect(s) detected. Review the affected production process immediately.`,
      });
    }

    if (stats.defects > stats.no_defects) {
      recommendations.push({
        type: "warning",
        text:
          "Defective products exceed defect-free products. Production quality should be reviewed.",
      });
    }

    if (stats.quality_score >= 90) {
      recommendations.push({
        type: "success",
        text:
          "Factory quality performance is excellent. Continue routine quality monitoring.",
      });
    } else if (stats.quality_score >= 75) {
      recommendations.push({
        type: "success",
        text:
          "Factory quality performance is stable. Continue regular inspections and monitoring.",
      });
    } else {
      recommendations.push({
        type: "warning",
        text:
          "Quality score requires attention. Review recurring defect patterns and production processes.",
      });
    }

    if (stats.moderate > 0) {
      recommendations.push({
        type: "info",
        text:
          "Monitor medium-severity defects regularly to prevent escalation.",
      });
    }

    if (recommendations.length < 3) {
      recommendations.push({
        type: "success",
        text:
          "Maintain preventive quality checks and routine inspection practices.",
      });
    }
  }

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    if (status === "Excellent") {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    }

    if (status === "Good") {
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }

    if (status === "Average") {
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    }

    if (status === "No Data") {
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }

    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  // =========================================================
  // RISK STYLE
  // =========================================================

  const getRiskStyle = (risk) => {
    const value = String(risk).toLowerCase();

    if (value.includes("low")) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    }

    if (
      value.includes("medium") ||
      value.includes("moderate")
    ) {
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    }

    if (
      value.includes("high") ||
      value.includes("critical")
    ) {
      return "bg-red-500/20 text-red-400 border-red-500/30";
    }

    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Layout title="Factory Quality Dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Factory
                  size={25}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  Factory Quality Overview
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Monitor production quality, defects, risk and inspection performance.
                </p>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">

            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>

            <span className="text-sm text-emerald-400 font-medium">
              Factory Monitoring Active
            </span>

          </div>

        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-emerald-400 text-lg font-semibold">
            Loading Factory Dashboard...
          </div>
        </div>
      ) : (
        <>
          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

            <SupervisorCard
              title="Total Inspections"
              value={stats.total}
              icon={<Activity size={23} />}
              iconClass="bg-blue-500/10 text-blue-400"
            />

            <SupervisorCard
              title="Passed Products"
              value={stats.no_defects}
              icon={<CheckCircle size={23} />}
              iconClass="bg-green-500/10 text-green-400"
            />

            <SupervisorCard
              title="Defective Products"
              value={stats.defects}
              icon={<AlertTriangle size={23} />}
              iconClass="bg-red-500/10 text-red-400"
            />

            <SupervisorCard
              title="Quality Score"
              value={`${stats.quality_score}%`}
              icon={<ShieldCheck size={23} />}
              iconClass="bg-purple-500/10 text-purple-400"
            />

            <SupervisorCard
              title="High Severity"
              value={stats.critical}
              icon={<TriangleAlert size={23} />}
              iconClass="bg-red-500/10 text-red-400"
            />

            <SupervisorCard
              title="Avg Confidence"
              value={`${stats.average_confidence}%`}
              icon={<TrendingUp size={23} />}
              iconClass="bg-yellow-500/10 text-yellow-400"
            />

          </div>

          {/* =================================================
              STATUS ROW
          ================================================= */}

          <div className="grid md:grid-cols-2 gap-6 mt-6">

            {/* Production Status */}

            <div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700 shadow-lg">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Factory
                    size={20}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Production Status
                  </h3>

                  <p className="text-xs text-gray-500">
                    Overall factory performance
                  </p>
                </div>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-gray-400 text-sm">
                  Current Status
                </span>

                <span
                  className={`px-4 py-2 rounded-full border text-sm font-semibold ${getStatusStyle(
                    stats.production_status
                  )}`}
                >
                  {stats.production_status || "No Data"}
                </span>

              </div>

            </div>

            {/* Overall Risk */}

            <div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700 shadow-lg">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <ShieldCheck
                    size={20}
                    className="text-red-400"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Overall Quality Risk
                  </h3>

                  <p className="text-xs text-gray-500">
                    Factory-level risk assessment
                  </p>
                </div>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-gray-400 text-sm">
                  Risk Level
                </span>

                <span
                  className={`px-4 py-2 rounded-full border text-sm font-semibold ${getRiskStyle(
                    stats.overall_risk
                  )}`}
                >
                  {stats.overall_risk || "No Data"}
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              ANALYTICS
          ================================================= */}

          <div className="grid lg:grid-cols-2 gap-6 mt-8">

            {/* Defect Distribution */}

            <div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700 shadow-lg">

              <div className="flex items-center gap-3 mb-5">

                <BarChart3
                  className="text-emerald-400"
                  size={22}
                />

                <div>
                  <h3 className="text-xl font-bold">
                    Defect Distribution
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Passed versus defective products
                  </p>
                </div>

              </div>

              <ResponsiveContainer width="100%" height={300}>

                <PieChart>

                  <Pie
                    data={defectData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={105}
                    label
                  >
                    {defectData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

            {/* Severity */}

            <div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700 shadow-lg">

              <div className="flex items-center gap-3 mb-5">

                <AlertTriangle
                  className="text-orange-400"
                  size={22}
                />

                <div>
                  <h3 className="text-xl font-bold">
                    Factory Defect Severity
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Distribution of detected defect severity
                  </p>
                </div>

              </div>

              <ResponsiveContainer width="100%" height={300}>

                <BarChart data={severityData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                  />

                  <YAxis
                    stroke="#9CA3AF"
                    allowDecimals={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#10B981"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* =================================================
              INSPECTION TRENDS
          ================================================= */}

          <div className="mt-8 bg-[#1F2937] rounded-2xl p-6 border border-gray-700 shadow-lg">

            <div className="flex items-center gap-3 mb-5">

              <TrendingUp
                className="text-blue-400"
                size={22}
              />

              <div>
                <h3 className="text-xl font-bold">
                  Inspection Trends
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Monitor inspection activity over time
                </p>
              </div>

            </div>

            <ResponsiveContainer width="100%" height={320}>

              <LineChart
                data={stats.trend || []}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                />

                <XAxis
                  dataKey="day"
                  stroke="#9CA3AF"
                />

                <YAxis
                  stroke="#9CA3AF"
                  allowDecimals={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="inspections"
                  name="Inspections"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* =================================================
              QUALITY OUTCOME TRENDS
          ================================================= */}

          <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 border border-gray-700 shadow-lg">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">

                  <TrendingUp
                    className="text-emerald-400"
                    size={22}
                  />

                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Quality Outcome Trends
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Passed and failed inspections over time
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-5 text-sm">

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-gray-300">
                    Passed
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-gray-300">
                    Failed
                  </span>
                </div>

              </div>

            </div>

            <ResponsiveContainer width="100%" height={320}>

              <LineChart
                data={stats.outcome_trend || []}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                />

                <XAxis
                  dataKey="day"
                  stroke="#9CA3AF"
                />

                <YAxis
                  stroke="#9CA3AF"
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="passed"
                  name="Passed"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  connectNulls
                />

                <Line
                  type="monotone"
                  dataKey="failed"
                  name="Failed"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  connectNulls
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* =================================================
              RECENT INSPECTIONS
          ================================================= */}

          <div className="mt-8 bg-[#1F2937] rounded-2xl p-6 border border-gray-700 shadow-lg">

            <div className="flex items-center gap-3 mb-6">

              <Clock
                className="text-emerald-400"
                size={22}
              />

              <div>
                <h3 className="text-xl font-bold">
                  Recent Factory Inspection Activity
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Latest factory inspection results
                </p>
              </div>

            </div>

            {stats.recent.length > 0 ? (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-gray-700">

                      <th className="py-3 text-left text-sm text-gray-400">
                        Filename
                      </th>

                      <th className="py-3 text-left text-sm text-gray-400">
                        Result
                      </th>

                      <th className="py-3 text-left text-sm text-gray-400">
                        Confidence
                      </th>

                      <th className="py-3 text-left text-sm text-gray-400">
                        Severity
                      </th>

                      <th className="py-3 text-left text-sm text-gray-400">
                        Risk
                      </th>

                      <th className="py-3 text-left text-sm text-gray-400">
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {stats.recent.map((item, index) => (

                      <tr
                        key={`${item.filename}-${item.date}-${index}`}
                        className="border-b border-gray-800 hover:bg-[#374151] transition"
                      >

                        <td className="py-4 text-sm">
                          {item.filename || "-"}
                        </td>

                        <td className="py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.defect === "No Defect"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {item.defect || "-"}
                          </span>

                        </td>

                        <td className="py-4 text-sm">
                          {item.confidence ?? 0}%
                        </td>

                        <td className="py-4">

                          <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs">
                            {item.severity || "-"}
                          </span>

                        </td>

                        <td className="py-4">

                          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                            {item.risk || "-"}
                          </span>

                        </td>

                        <td className="py-4 text-sm text-gray-400">
                          {item.date || "-"}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="text-center text-gray-400 py-10">
                No recent inspections found.
              </div>

            )}

          </div>

          {/* =================================================
              PRODUCTION QUALITY REPORT
          ================================================= */}

          <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 shadow-lg">

            <div className="flex items-center gap-3 mb-6">

              <ShieldCheck className="text-emerald-400" />

              <h2 className="text-2xl font-bold">
                Production Quality Summary
              </h2>

            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              <ReportCard
                title="Total Inspections"
                value={stats.total}
              />

              <ReportCard
                title="Passed Products"
                value={stats.no_defects}
                valueClass="text-green-400"
              />

              <ReportCard
                title="Rejected Products"
                value={stats.defects}
                valueClass="text-red-400"
              />

              <ReportCard
                title="Quality Score"
                value={`${stats.quality_score}%`}
                valueClass="text-purple-400"
              />

              <ReportCard
                title="Average Confidence"
                value={`${stats.average_confidence}%`}
                valueClass="text-yellow-400"
              />

              <div className="bg-[#111827] rounded-xl p-5">

                <h3 className="text-gray-400 mb-3">
                  Overall Status
                </h3>

                <span
                  className={`inline-block px-4 py-2 rounded-full font-bold ${getStatusStyle(
                    stats.production_status
                  )}`}
                >
                  {stats.production_status || "No Data"}
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              RECOMMENDATIONS
          ================================================= */}

          <div className="mt-8 bg-[#1F2937] rounded-2xl p-6 border border-gray-700 shadow-lg">

            <div className="flex items-center gap-3 mb-6">

              <ShieldCheck
                className="text-emerald-400"
                size={23}
              />

              <div>

                <h3 className="text-xl font-bold">
                  Quality Management Recommendations
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Recommendations based on current inspection performance
                </p>

              </div>

            </div>

            <div className="space-y-3">

              {recommendations.map(
                (recommendation, index) => (

                  <Recommendation
                    key={index}
                    type={recommendation.type}
                    text={recommendation.text}
                  />

                )
              )}

            </div>

          </div>
        </>
      )}

    </Layout>
  );
}

// =========================================================
// SUPERVISOR CARD
// =========================================================

function SupervisorCard({
  title,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="bg-[#1F2937] border border-gray-700 rounded-2xl p-5 shadow-lg hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs text-gray-500">
            {title}
          </p>

          <p className="text-3xl font-bold mt-2">
            {value}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

// =========================================================
// REPORT CARD
// =========================================================

function ReportCard({
  title,
  value,
  valueClass = "text-white",
}) {
  return (
    <div className="bg-[#111827] rounded-xl p-5">

      <h3 className="text-gray-400">
        {title}
      </h3>

      <p
        className={`text-3xl font-bold mt-2 ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}

// =========================================================
// RECOMMENDATION
// =========================================================

function Recommendation({
  type,
  text,
}) {
  const styles = {
    success:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",

    warning:
      "bg-orange-500/10 border-orange-500/20 text-orange-300",

    info:
      "bg-blue-500/10 border-blue-500/20 text-blue-300",
  };

  const icons = {
    success: <CheckCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Activity size={18} />,
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${
        styles[type] || styles.info
      }`}
    >

      <div className="mt-0.5 shrink-0">
        {icons[type] || icons.info}
      </div>

      <p className="text-sm leading-6">
        {text}
      </p>

    </div>
  );
}

export default SupervisorDashboard;