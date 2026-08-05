const API_URL = "http://127.0.0.1:8000";

export async function runInspection(file, category) {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_URL}/predict?category=${encodeURIComponent(category)}&enable_yolo=true`;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API error response:", errorText);
    throw new Error(`Inspection failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const confVal = data.confidence_score != null
    ? (data.confidence_score > 1 ? Math.round(data.confidence_score) : Math.round(data.confidence_score * 100))
    : 99;

  return {
    inspectionId: data.inspection_id || `INSP-${Date.now()}`,
    productCategory: data.category || category,
    prediction: data.defect_class || "defect_detected",
    confidence: confVal,
    severityScore: data.severity_score ?? 0,
    severityLevel: data.severity_level || "Low",
    decision: (data.defect_result === "PASS" || data.defect_result === "Pass") ? "Pass" : "Reject",
    anomalyScore: data.anomaly_score ?? 0,
    threshold: data.threshold ?? 0,
    recommendedAction: data.recommended_action || "Normal operating parameters",
    processingTime: data.processing_time_ms || 0,
    qualityReport: data.quality_report || {},
    severityBreakdown: data.severity_breakdown || {},
    bbox: data.bbox || null,
    originalImage: data.original_image || (data.images && data.images.original) || '',
    croppedImage: data.cropped_image || (data.images && data.images.cropped) || '',
    reconstructedImage: data.reconstructed_image || (data.images && data.images.reconstructed) || data.cropped_image || '',
    heatmapImage: data.heatmap_image || (data.images && data.images.heatmap) || '',
    processedImage: data.overlay_image || (data.images && data.images.overlay) || '',
  };
}