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
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    defects: 0,
    no_defects: 0,
    accuracy: 0,
    recent: [],
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:8000/dashboard");
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

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
      title: "Accuracy",
      value: `${stats.accuracy}%`,
      icon: <Activity size={30} />,
      color: "bg-purple-500",
    },
  ];

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

  const barData = [
    {
      name: "Defective",
      count: stats.defects,
    },
    {
      name: "No Defect",
      count: stats.no_defects,
    },
  ];

  const COLORS = ["#EF4444", "#22C55E"];

  return (
    <Layout title="Dashboard">
      {/* Statistics Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-[#1F2937] rounded-2xl p-6 shadow-lg hover:scale-105 transition duration-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">{card.title}</p>
                <h2 className="text-4xl font-bold mt-3">{card.value}</h2>
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mt-10">
        {/* Pie Chart */}
        <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">
            Defect Distribution
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">
            Inspection Statistics
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />

              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
              />

              <YAxis stroke="#9CA3AF" />

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

      {/* Recent Inspections */}
      <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-emerald-400" />
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
                    Defect
                  </th>
                  <th className="py-3 text-left">
                    Confidence
                  </th>
                  <th className="py-3 text-left">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {stats.recent.map((item, index) => (
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
                      {item.date}
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

      {/* Dashboard Summary */}
      <div className="mt-10 bg-[#1F2937] rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <ShieldCheck className="text-emerald-400" />
          <h2 className="text-2xl font-bold">
            Dashboard Summary
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-[#111827] rounded-xl p-5">
            <h3 className="text-gray-400">
              Total Images Processed
            </h3>
            <p className="text-3xl font-bold mt-2">
              {stats.total}
            </p>
          </div>

          <div className="bg-[#111827] rounded-xl p-5">
            <h3 className="text-gray-400">
              Defective Images
            </h3>
            <p className="text-3xl font-bold text-red-400 mt-2">
              {stats.defects}
            </p>
          </div>

          <div className="bg-[#111827] rounded-xl p-5">
            <h3 className="text-gray-400">
              No Defect Images
            </h3>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {stats.no_defects}
            </p>
          </div>

          <div className="bg-[#111827] rounded-xl p-5">
            <h3 className="text-gray-400">
              Model Accuracy
            </h3>
            <p className="text-3xl font-bold text-purple-400 mt-2">
              {stats.accuracy}%
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;