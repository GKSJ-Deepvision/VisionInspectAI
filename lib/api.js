const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export async function runInspection(file, category) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("category", category || "bottle");
  formData.append("enable_yolo", "true");

  const response = await fetch(`${API_URL}/inspect`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Inspection failed: ${errorText || response.statusText}`
    );
  }

  const data = await response.json();

  const result = data.inspection_result || {};

  return {
    inspectionId: result.inspection_id,

    productCategory:
      result.category || category || "unknown",

    prediction:
      result.defect_class || result.defect || "unknown",

    confidence: Math.round(
      Number(result.confidence_score || result.confidence || 0)
    ),

    severityScore:
      result.severity_score ?? 0,

    severityLevel:
      result.severity_level || "Unknown",

    decision:
      result.defect_result === "PASS"
        ? "Pass"
        : "Reject",

    anomalyScore:
      result.anomaly_score ?? 0,

    threshold:
      result.threshold ?? null,

    recommendedAction:
      result.recommended_action || null,

    processingTime:
      result.processing_time_ms ?? null,

    qualityReport:
      data.inspection_report || null,

    severityBreakdown:
      result.severity_breakdown || null,

    bbox:
      result.bbox || null,

    originalImage:
      result.images?.original || null,

    croppedImage:
      result.images?.cropped || null,

    reconstructedImage:
      result.images?.reconstructed || null,

    heatmapImage:
      result.images?.heatmap || null,

    processedImage:
      result.images?.overlay || null,
  };
}