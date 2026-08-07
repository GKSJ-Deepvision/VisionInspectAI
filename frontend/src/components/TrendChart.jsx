import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function TrendChart({ history }) {

  const dailyData = {};

  history.forEach((item) => {

    const date = new Date(item.created_at)
      .toLocaleDateString();

    if (!dailyData[date]) {
      dailyData[date] = 0;
    }

    dailyData[date]++;

  });

  const chartData = Object.keys(dailyData).map((date) => ({
    date,
    inspections: dailyData[date],
  }));

  return (

    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">

      <h2 className="text-2xl font-bold mb-6">
        Inspection Trend
      </h2>

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <LineChart data={chartData}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="inspections"
            stroke="#2563eb"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}