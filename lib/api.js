const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export async function runInspection(file, category) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("category", category || "bottle");
  formData.append("enable_yolo", "true");
  formData.append(
  "username",
  localStorage.getItem("vi_username") || "default"
);

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

  confidence: (() => {
  const value = Number(
    result.confidence_score ?? result.confidence ?? 0
  );

  return Math.round(value <= 1 ? value * 100 : value);
})(),

  isAnomaly:
    result.is_anomaly ?? false,

  anomalyScore:
    result.anomaly_score ?? 0,

  threshold:
    result.threshold ?? null,

  normalizedScore:
    result.normalized_score ?? null,

  severityScore:
    result.severity_score ?? 0,

  severityLevel:
    result.severity_level || "Unknown",

  decision:
    result.defect_result === "PASS"
      ? "Pass"
      : "Reject",

  yoloStatus:
    result.yolo_status || null,

  classProbabilities:
    result.class_probabilities || {},

  recommendedAction:
    result.recommended_action || null,

  processingTime:
    result.processing_time_ms ?? null,

  qualityReport:
    result.quality_report || null,

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

export async function getInspectionHistory() {
  const response = await fetch(`${API_URL}/history`);

  if (!response.ok) {
    throw new Error("Failed to load inspection history");
  }

  return response.json();
}

export async function getAnalytics() {
  const response = await fetch(`${API_URL}/analytics`);

  if (!response.ok) {
    throw new Error("Failed to load analytics");
  }

  return response.json();
}

export async function getStoredReports() {
  const response = await fetch(`${API_URL}/reports`);

  if (!response.ok) {
    throw new Error("Failed to load reports");
  }

  return response.json();
}

export async function getInspectionReport(inspectionId, format = "json") {
  const response = await fetch(
    `${API_URL}/report/${inspectionId}?format=${format}`
  );

  if (!response.ok) {
    throw new Error("Failed to load inspection report");
  }

  return response.json();
}