const API_URL = "http://127.0.0.1:8000";

export async function runInspection(file, category) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/predict?category=${category}&enable_yolo=true`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Inspection failed");
  }

  const data = await response.json();

  return {
    inspectionId: data.inspection_id,

    productCategory: data.category,

    prediction: data.defect_class,

    confidence: Math.round(data.confidence_score * 100),

    severityScore: data.severity_score,

    severityLevel: data.severity_level,

    decision:
      data.defect_result === "PASS"
        ? "Pass"
        : "Reject",

    anomalyScore: data.anomaly_score,

    threshold: data.threshold,

    recommendedAction: data.recommended_action,

    processingTime: data.processing_time_ms,

    qualityReport: data.quality_report,

    severityBreakdown: data.severity_breakdown,

    bbox: data.bbox,

    originalImage: data.images.original,

    croppedImage: data.images.cropped,

    reconstructedImage: data.images.reconstructed,

    heatmapImage: data.images.heatmap,

    processedImage: data.images.overlay,
  };
}