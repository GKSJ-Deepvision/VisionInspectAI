import Layout from "../components/Layout";
import {
  Image,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const stats = [
  {
    title: "Images Uploaded",
    value: 156,
    icon: <Image size={30} className="text-emerald-400" />,
    trend: "+12%",
    color: "text-emerald-400",
  },
  {
    title: "Normal Products",
    value: 138,
    icon: <CheckCircle size={30} className="text-green-400" />,
    trend: "+8%",
    color: "text-green-400",
  },
  {
    title: "Defects Found",
    value: 18,
    icon: <AlertTriangle size={30} className="text-yellow-400" />,
    trend: "-3%",
    color: "text-yellow-400",
  },
  {
    title: "Accuracy",
    value: "98.5%",
    icon: <BarChart3 size={30} className="text-blue-400" />,
    trend: "+1.2%",
    color: "text-blue-400",
  },
];

const pieData = [
  {
    name: "Normal",
    value: 138,
  },
  {
    name: "Defective",
    value: 18,
  },
];

const COLORS = ["#10B981", "#EF4444"];

const barData = [
  { day: "Mon", uploads: 15 },
  { day: "Tue", uploads: 22 },
  { day: "Wed", uploads: 18 },
  { day: "Thu", uploads: 30 },
  { day: "Fri", uploads: 26 },
  { day: "Sat", uploads: 21 },
  { day: "Sun", uploads: 17 },
];

function Dashboard() {
  return (
    <Layout title="Dashboard">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-[#1F2937] rounded-2xl p-6 shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <div>{item.icon}</div>

              <span
                className={`${item.color} bg-black/20 px-3 py-1 rounded-full text-xs font-semibold`}
              >
                ↑ {item.trend}
              </span>
            </div>

            <h3 className="text-gray-400 mt-6">{item.title}</h3>

            <h1 className="text-4xl font-bold mt-2">{item.value}</h1>

            <p className="text-gray-500 text-sm mt-3">
              Compared to last week
            </p>

            <div className="mt-4 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{
                  width:
                    item.title === "Images Uploaded"
                      ? "75%"
                      : item.title === "Normal Products"
                      ? "88%"
                      : item.title === "Defects Found"
                      ? "35%"
                      : "98%",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Pie Chart */}
        <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6">
            Inspection Summary
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6">
            Weekly Uploads
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="uploads"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Inspection Table */}
      <div className="bg-[#1F2937] rounded-2xl p-6 shadow-lg mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Recent Inspections
          </h2>

          <button className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-3">Image</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Confidence</th>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-gray-800 hover:bg-[#111827] transition">
                <td className="py-4">Bottle_001.png</td>

                <td>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    Normal
                  </span>
                </td>

                <td>99.2%</td>

                <td>10 Jul 2026</td>

                <td>
                  <button className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-sm">
                    View
                  </button>
                </td>
              </tr>

              <tr className="border-b border-gray-800 hover:bg-[#111827] transition">
                <td className="py-4">Cable_012.png</td>

                <td>
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                    Defective
                  </span>
                </td>

                <td>96.8%</td>

                <td>09 Jul 2026</td>

                <td>
                  <button className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-sm">
                    View
                  </button>
                </td>
              </tr>

              <tr className="border-b border-gray-800 hover:bg-[#111827] transition">
                <td className="py-4">Tile_104.png</td>

                <td>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    Normal
                  </span>
                </td>

                <td>98.7%</td>

                <td>08 Jul 2026</td>

                <td>
                  <button className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-sm">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;