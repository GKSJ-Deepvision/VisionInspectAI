import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

import {
  FileImage,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  ShieldCheck,
  TrendingUp,
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

function Dashboard() {

  const [stats, setStats] = useState({
    total: 0,
    defects: 0,
    no_defects: 0,
    critical: 0,
    moderate: 0,
    minor: 0,
    average_confidence: 0,
    quality_score: 0,
    production_status: "",
    overall_risk: "",
    trend: [],
    outcome_trend: [],
    recent: [],
  });

  const [loading, setLoading] = useState(true);

  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  // =========================================================
  // FETCH DASHBOARD
  // =========================================================

  const fetchDashboard = async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/dashboard`,
        {
          params: {
            username: username,
            role: role,
          },
        }
      );

      console.log(
        "Dashboard data:",
        res.data
      );

      setStats({
        total: res.data.total || 0,

        defects: res.data.defects || 0,

        no_defects:
          res.data.no_defects || 0,

        critical:
          res.data.critical || 0,

        moderate:
          res.data.moderate || 0,

        minor:
          res.data.minor || 0,

        average_confidence:
          res.data.average_confidence || 0,

        quality_score:
          res.data.quality_score || 0,

        production_status:
          res.data.production_status || "",

        overall_risk:
          res.data.overall_risk || "",

        trend:
          res.data.trend || [],

        outcome_trend:
          res.data.outcome_trend || [],

        recent:
          res.data.recent || [],
      });

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {

    if (username && role) {
      fetchDashboard();
    }

  }, []);

  // =========================================================
  // STATISTICS CARDS
  // =========================================================

  const cards = [
    {
      title: "Total Inspections",
      value: stats.total,
      icon: <FileImage size={30} />,
      color: "bg-blue-500",
    },
    {
      title: "Defective Images",
      value: stats.defects,
      icon: <AlertTriangle size={30} />,
      color: "bg-red-500",
    },
    {
      title: "No Defect",
      value: stats.no_defects,
      icon: <CheckCircle size={30} />,
      color: "bg-green-500",
    },
    {
      title: "Quality Score",
      value: `${stats.quality_score}%`,
      icon: <ShieldCheck size={30} />,
      color: "bg-purple-500",
    },
    {
      title: "Average Confidence",
      value: `${stats.average_confidence}%`,
      icon: <Activity size={30} />,
      color: "bg-yellow-500",
    },
    {
      title: "High Severity",
      value: stats.critical,
      icon: <AlertTriangle size={30} />,
      color: "bg-red-700",
    },
    {
      title: "Medium Severity",
      value: stats.moderate,
      icon: <AlertTriangle size={30} />,
      color: "bg-orange-500",
    },
    {
      title: "Low Severity",
      value: stats.minor,
      icon: <CheckCircle size={30} />,
      color: "bg-emerald-500",
    },
  ];

  // =========================================================
  // PIE DATA
  // =========================================================

  const pieData = [
    {
      name: "Defective",
      value: stats.defects,
    },
    {
      name: "No Defect",
      value: stats.no_defects,
    },
  ];

  const COLORS = [
    "#EF4444",
    "#22C55E"
  ];

  // =========================================================
  // BAR DATA
  // =========================================================

  const barData = [
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

  const trendData =
    stats.trend || [];

  const outcomeTrendData =
    stats.outcome_trend || [];

  // =========================================================
  // UI
  // =========================================================

  return (
    <Layout title="Dashboard">

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <div className="flex items-center justify-center py-20">

          <div className="text-emerald-400 text-lg font-semibold">
            Loading Dashboard...
          </div>

        </div>

      ) : (

        <>

          {/* =================================================
              STATISTICS CARDS
          ================================================= */}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {cards.map((card, index) => (

              <div
                key={index}
                className="bg-[#1F2937] rounded-2xl p-6 shadow-lg hover:scale-105 transition duration-300"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-gray-400 text-sm">
                      {card.title}
                    </p>

                    <h2 className="text-4xl font-bold mt-3">
                      {card.value}
                    </h2>

                  </div>

                  <div
                    className={`${card.color} w-16 h-16 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    {card.icon}
                  </div>

                </div>

              </div>

            ))}

          </div>

          {/* =================================================
              CHARTS
          ================================================= */}

          <div className="grid lg:grid-cols-2 gap-8 mt-10">

            {/* DEFECT DISTRIBUTION */}

            <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg">

              <h2 className="text-2xl font-bold mb-6">
                Defect Distribution
              </h2>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    label
                  >

                    {pieData.map(
                      (entry, index) => (

                        <Cell
                          key={index}
                          fill={COLORS[index]}
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

            {/* INSPECTION STATISTICS */}

            <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg">

              <h2 className="text-2xl font-bold mb-6">
                Inspection Statistics
              </h2>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart data={barData}>

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
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#10B981"
                    radius={[
                      8,
                      8,
                      0,
                      0
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* =================================================
              INSPECTION TRENDS
          ================================================= */}

          <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 shadow-lg">

            <div className="flex items-center gap-3 mb-6">

              <TrendingUp
                className="text-blue-400"
                size={24}
              />

              <div>

                <h2 className="text-2xl font-bold">
                  Inspection Trends
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Monitor inspection activity over time
                </p>

              </div>

            </div>

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <LineChart data={trendData}>

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

          <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 shadow-lg">

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

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <LineChart
                data={outcomeTrendData}
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
              QUALITY ASSESSMENT
          ================================================= */}

          <div className="grid md:grid-cols-2 gap-8 mt-10">

            {/* PRODUCTION STATUS */}

            <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg">

              <div className="flex items-center gap-3 mb-5">

                <ShieldCheck
                  className="text-emerald-400"
                  size={24}
                />

                <div>

                  <h2 className="text-2xl font-bold">
                    Production Quality Status
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Current overall production quality performance
                  </p>

                </div>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-gray-400">
                  Current Status
                </span>

                <span
                  className={`px-4 py-2 rounded-full font-semibold ${
                    stats.production_status === "Excellent"
                      ? "bg-green-500/20 text-green-400"
                      : stats.production_status === "Good"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : stats.production_status === "Average"
                      ? "bg-orange-500/20 text-orange-400"
                      : stats.production_status === "No Data"
                      ? "bg-gray-500/20 text-gray-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {stats.production_status || "No Data"}
                </span>

              </div>

            </div>

            {/* QUALITY RISK */}

            <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg">

              <div className="flex items-center gap-3 mb-5">

                <AlertTriangle
                  className="text-orange-400"
                  size={24}
                />

                <div>

                  <h2 className="text-2xl font-bold">
                    Overall Quality Risk
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Current risk level based on inspection results
                  </p>

                </div>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-gray-400">
                  Risk Level
                </span>

                <span
                  className={`px-4 py-2 rounded-full font-semibold ${
                    String(stats.overall_risk)
                      .toLowerCase()
                      .includes("low")
                      ? "bg-green-500/20 text-green-400"
                      : String(stats.overall_risk)
                          .toLowerCase()
                          .includes("medium")
                      ? "bg-orange-500/20 text-orange-400"
                      : String(stats.overall_risk)
                          .toLowerCase()
                          .includes("high")
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {stats.overall_risk || "No Data"}
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              RECENT INSPECTIONS
          ================================================= */}

          <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 shadow-lg">

            <div className="flex items-center gap-3 mb-6">

              <Clock
                className="text-emerald-400"
              />

              <h2 className="text-2xl font-bold">
                Recent Inspections
              </h2>

            </div>

            {stats.recent.length > 0 ? (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-gray-700">

                      <th className="py-3 text-left">
                        Filename
                      </th>

                      <th className="py-3 text-left">
                        Result
                      </th>

                      <th className="py-3 text-left">
                        Confidence
                      </th>

                      <th className="py-3 text-left">
                        Severity
                      </th>

                      <th className="py-3 text-left">
                        Risk
                      </th>

                      <th className="py-3 text-left">
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {stats.recent.map(
                      (item, index) => (

                        <tr
                          key={index}
                          className="border-b border-gray-800 hover:bg-[#374151] transition"
                        >

                          <td className="py-4">
                            {item.filename}
                          </td>

                          <td className="py-4">

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                item.defect === "No Defect"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {item.defect}
                            </span>

                          </td>

                          <td className="py-4">
                            {item.confidence}%
                          </td>

                          <td className="py-4">

                            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
                              {item.severity}
                            </span>

                          </td>

                          <td className="py-4">

                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                              {item.risk}
                            </span>

                          </td>

                          <td className="py-4">
                            {item.date}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="text-center text-gray-400 py-10">
                No recent inspections found.
              </div>

            )}

          </div>

        </>

      )}

    </Layout>
  );
}

export default Dashboard;