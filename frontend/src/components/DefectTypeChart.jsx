import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
} from "recharts";

export default function DefectTypeChart({
  history,
}) {

  const defectMap = {};

  history.forEach((item) => {

    const defect =
      item.defect_type || "Unknown";

    defectMap[defect] =
      (defectMap[defect] || 0) + 1;

  });

  const data = Object.keys(defectMap).map(
    (key) => ({
      name: key,
      value: defectMap[key],
    })
  );

  const COLORS = [
    "#2563eb",
    "#ef4444",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
  ];

  return (

    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        Defect Type Distribution
      </h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            outerRadius={110}
            label
          >

            {data.map((entry, index) => (

              <Cell
                key={index}
                fill={
                  COLORS[
                    index % COLORS.length
                  ]
                }
              />

            ))}

          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>

      </ResponsiveContainer>

    </div>

  );
}