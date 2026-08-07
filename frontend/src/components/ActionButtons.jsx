import jsPDF from "jspdf";
import { deleteInspection } from "../services/api";
import toast from "react-hot-toast";

import {
  Eye,
  FileDown,
  Trash2,
} from "lucide-react";

export default function ActionButtons({
  inspection,
  onView,
  onDelete,
}) {

  // -----------------------
  // Download PDF
  // -----------------------

  const downloadPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("VisionInspect AI", 20, 20);

    doc.setFontSize(15);
    doc.text("AI Inspection Report", 20, 32);

    doc.line(20, 36, 190, 36);

    doc.setFontSize(12);

    doc.text(`Inspection ID : ${inspection.id}`,20,50);
    doc.text(`Image : ${inspection.image_name}`,20,60);
    doc.text(`Prediction : ${inspection.prediction}`,20,70);
    doc.text(`Confidence : ${inspection.confidence}%`,20,80);

    doc.text(`Defect Type : ${inspection.defect_type}`,20,90);
    doc.text(`Severity : ${inspection.severity}`,20,100);
    doc.text(`Risk Score : ${inspection.risk_score}`,20,110);
    doc.text(`Recommendation : ${inspection.recommendation}`,20,120);

    doc.text(
      `Date : ${new Date(
        inspection.created_at
      ).toLocaleString()}`,
      20,
      135
    );

    doc.save(`Inspection_${inspection.id}.pdf`);

    toast.success("PDF Downloaded Successfully");

  };

  // -----------------------
  // Delete Inspection
  // -----------------------

  const handleDelete = async () => {

    const confirmDelete = window.confirm(
      `Delete Inspection #${inspection.id}?`
    );

    if (!confirmDelete) return;

    try {

      await deleteInspection(inspection.id);

      toast.success("Inspection Deleted Successfully");

      if (onDelete) {
        onDelete();
      }

    } catch (err) {

      console.error(err);

      toast.error("Failed to Delete Inspection");

    }

  };

  return (

    <div className="flex justify-center gap-2">

      {/* View */}

      <button
        title="View Report"
        onClick={(e) => {
          e.stopPropagation();
          onView(inspection);
        }}
        className="
          p-2
          rounded-lg
          bg-blue-600
          hover:bg-blue-700
          text-white
          transition-all
          duration-300
          hover:scale-110
          shadow
        "
      >

        <Eye size={18} />

      </button>

      {/* PDF */}

      <button
        title="Download PDF"
        onClick={(e) => {
          e.stopPropagation();
          downloadPDF();
        }}
        className="
          p-2
          rounded-lg
          bg-red-600
          hover:bg-red-700
          text-white
          transition-all
          duration-300
          hover:scale-110
          shadow
        "
      >

        <FileDown size={18} />

      </button>

      {/* Delete */}

      <button
        title="Delete Inspection"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        className="
          p-2
          rounded-lg
          bg-gray-800
          hover:bg-black
          text-white
          transition-all
          duration-300
          hover:scale-110
          shadow
        "
      >

        <Trash2 size={18} />

      </button>

    </div>

  );

}