import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsChart({ history }) {

  const good = history.filter(
    (item) => item.prediction === "GOOD"
  ).length;

  const defect = history.filter(
    (item) => item.prediction === "DEFECT"
  ).length;

  const data = [
    {
      name: "Good Products",
      value: good,
    },
    {
      name: "Defective Products",
      value: defect,
    },
  ];

  const COLORS = [
    "#22c55e",
    "#ef4444",
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-2">
        Manufacturing Analytics
      </h2>

      <p className="text-gray-500 mb-6">
        Good vs Defective Products
      </p>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>

          <PieChart>

            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              dataKey="value"
              label={({ percent }) =>
                `${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
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

    </div>
  );
}