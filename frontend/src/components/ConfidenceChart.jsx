import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function ConfidenceChart({ history }) {
  const data = history.map((item) => ({
    id: item.id,
    confidence: Number(item.confidence),
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-3xl font-bold mb-6">
        Confidence Analysis
      </h2>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="id" />

            <YAxis domain={[0, 100]} />

            <Tooltip />

            <Bar
              dataKey="confidence"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}