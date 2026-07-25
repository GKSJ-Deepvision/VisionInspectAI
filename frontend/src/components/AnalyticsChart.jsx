import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsChart({ history }) {
  const good = history.filter((h) => h.prediction === "GOOD").length;
  const defect = history.filter((h) => h.prediction === "DEFECT").length;

  const data = [
    { name: "GOOD", value: good },
    { name: "DEFECT", value: defect },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Inspection Analytics
      </h2>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={120}
              label
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