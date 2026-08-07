import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ExportExcel({ history }) {

  const exportExcel = () => {

    if (history.length === 0) {
      alert("No inspection data available.");
      return;
    }

    const data = history.map((item) => ({
      ID: item.id,
      Image: item.image_name,
      Prediction: item.prediction,
      Confidence: `${Number(item.confidence).toFixed(2)}%`,
      "Defect Type": item.defect_type,
      Severity: item.severity,
      "Risk Score": item.risk_score,
      Recommendation: item.recommendation,
      Date: new Date(item.created_at).toLocaleString(),
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Inspection History"
    );

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, "inspection_history.xlsx");
  };

  return (
    <button
      onClick={exportExcel}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg shadow"
    >
      Export Excel
    </button>
  );
}