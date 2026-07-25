export default function StatsCards({ history }) {
  const total = history.length;

  const good = history.filter(
    (item) => item.prediction === "GOOD"
  ).length;

  const defect = history.filter(
    (item) => item.prediction === "DEFECT"
  ).length;

  const avg =
    total > 0
      ? (
          history.reduce(
            (sum, item) => sum + Number(item.confidence),
            0
          ) / total
        ).toFixed(2)
      : 0;

  const Card = ({ title, value, color }) => (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-gray-500">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  );

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <Card
        title="Total"
        value={total}
        color="text-blue-600"
      />

      <Card
        title="GOOD"
        value={good}
        color="text-green-600"
      />

      <Card
        title="DEFECT"
        value={defect}
        color="text-red-600"
      />

      <Card
        title="Avg Confidence"
        value={`${avg}%`}
        color="text-purple-600"
      />
    </div>
  );
}