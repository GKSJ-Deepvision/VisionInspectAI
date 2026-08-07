export default function ExportCSV({ history }) {

  const exportCSV = () => {

    if (history.length === 0) {
      alert("No inspection data available.");
      return;
    }

    const headers = [
      "ID",
      "Image",
      "Prediction",
      "Confidence",
      "Defect Type",
      "Severity",
      "Risk Score",
      "Recommendation",
      "Date"
    ];

    const rows = history.map((item) => [
      item.id,
      item.image_name,
      item.prediction,
      item.confidence,
      item.defect_type,
      item.severity,
      item.risk_score,
      item.recommendation,
      new Date(item.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "inspection_history.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportCSV}
      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
    >
      Export CSV
    </button>
  );
}