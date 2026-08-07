import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function SeverityChart({ history }) {

  const severityCount = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  history.forEach((item) => {
    if (severityCount[item.severity] !== undefined) {
      severityCount[item.severity]++;
    }
  });

  const data = [
    {
      severity: "LOW",
      count: severityCount.LOW,
    },
    {
      severity: "MEDIUM",
      count: severityCount.MEDIUM,
    },
    {
      severity: "HIGH",
      count: severityCount.HIGH,
    },
    {
      severity: "CRITICAL",
      count: severityCount.CRITICAL,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        Severity Distribution
      </h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >

        <BarChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="severity" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="count"
            fill="#ef4444"
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}