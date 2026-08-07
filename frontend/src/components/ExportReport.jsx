import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportReport({ history, dashboard }) {

  const generatePDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("VisionInspect AI", 14, 20);

    doc.setFontSize(12);
    doc.text(
      "Manufacturing Defect Detection Report",
      14,
      30
    );

    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      14,
      40
    );

    doc.text(
      `Total Inspections: ${dashboard.total_inspections}`,
      14,
      55
    );

    doc.text(
      `Good Products: ${dashboard.good_products}`,
      14,
      63
    );

    doc.text(
      `Defective Products: ${dashboard.defective_products}`,
      14,
      71
    );

    doc.text(
      `Critical Defects: ${dashboard.critical_defects}`,
      14,
      79
    );

    doc.text(
      `Quality Percentage: ${dashboard.quality_percentage}%`,
      14,
      87
    );

    autoTable(doc, {
      startY: 100,

      head: [[
        "ID",
        "Image",
        "Prediction",
        "Confidence",
        "Severity",
        "Risk"
      ]],

      body: history.map(item => [
        item.id,
        item.image_name,
        item.prediction,
        `${item.confidence}%`,
        item.severity,
        item.risk_score
      ])
    });

    doc.save("VisionInspect_Report.pdf");

  };

  return (

    <button
      onClick={generatePDF}
      className="bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700"
    >
      📄 Export PDF Report
    </button>

  );

}