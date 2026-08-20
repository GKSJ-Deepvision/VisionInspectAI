import { apiGet, apiPatch, apiPost } from "./api";
import { analyseImage } from "./imageAnalysis";


function appendMetadata(formData, metadata = {}) {
  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  return formData;
}

function imageFormData(file, metadata) {
  const formData = new FormData();
  formData.append("file", file);
  return appendMetadata(formData, metadata);
}

function batchFormData(files, metadata) {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });
  return appendMetadata(formData, metadata);
}

/** Build a full inspection result object from canvas analysis */
async function analyseToResult(file, metadata = {}, idx = 0) {
  const analysis = await analyseImage(file);
  const imageUrl = file ? URL.createObjectURL(file) : null;

  return {
    id: Date.now() + idx,
    filename: file?.name || `frame_${idx}.png`,
    pass_fail: analysis.isDefect ? "Fail" : "Pass",
    prediction: analysis.isDefect ? "Fail" : "Pass",
    defect_type: analysis.defectType,
    severity_level: analysis.severity_level,
    severity_score: analysis.severity_score,
    score: analysis.isDefect ? parseFloat((10 - analysis.anomalyScore).toFixed(2)) : parseFloat((10 - analysis.anomalyScore * 0.2).toFixed(2)),
    confidence: analysis.confidence,
    anomaly_score: analysis.anomalyScore,
    heatmap_url: null,
    image_url: imageUrl,
    batch_number: metadata.batch_number || "BAT-260820-01",
    product_id: metadata.product_id || "product",
    production_line: metadata.production_line || "line_1",
    shift: metadata.shift || "Shift A",
    operator_name: "Quality Engineer",
    review_status: "ai_completed",
    created_at: new Date().toISOString(),
    explainability: {
      decision_threshold: 0.75,
      defect_area_percent: analysis.isDefect ? parseFloat((analysis.anomalyScore * 2.1).toFixed(1)) : 0.0,
      heatmap_intensity_p95: analysis.isDefect ? parseFloat((analysis.anomalyScore / 10 + 0.1).toFixed(2)) : 0.04,
    },
  };
}

function mockCameraFrame(frameIndex = 0, label = "") {
  const labels = ["fabric_tear", "tile_crack", "leather_stain", "good_pass", "metal_scratch"];
  const currentLabel = label || labels[frameIndex % labels.length];
  const isDefect = !currentLabel.includes("good") && !currentLabel.includes("pass");
  return {
    id: Date.now() + frameIndex,
    source_label: currentLabel,
    prediction: isDefect ? "Fail" : "Pass",
    pass_fail: isDefect ? "Fail" : "Pass",
    defect_type: isDefect ? currentLabel.replace(/_/g, " ") : "none",
    severity_level: isDefect ? "high" : "none",
    severity_score: isDefect ? 8.2 : 0.0,
    anomaly_score: isDefect ? 8.2 : 0.2,
    confidence: 0.94,
    image_url: null,
    heatmap_url: null,
    created_at: new Date().toISOString(),
  };
}

// Upload Image
export function uploadInspection(file, metadata = {}) {
  return apiPost("/api/inspections/upload", imageFormData(file, metadata));
}

// AI Inspect — uses real backend when online, canvas analysis when offline
export async function inspectImage(file, metadata = {}) {
  try {
    const inspection = await apiPost("/api/inspections/inspect", imageFormData(file, metadata));
    // Trust the backend result — do NOT override with filename guessing
    return inspection;
  } catch {
    // Backend offline → use real canvas pixel analysis
    return analyseToResult(file, metadata, 0);
  }
}

// Batch Inspect — with real canvas analysis fallback
export async function inspectBatch(files, metadata = {}) {
  try {
    return await apiPost("/api/inspections/batch-inspect", batchFormData(files, metadata));
  } catch {
    const items = await Promise.all(
      Array.from(files).map((f, i) => analyseToResult(f, metadata, i))
    );
    const passed = items.filter((it) => it.pass_fail === "Pass").length;
    return {
      items,
      total: items.length,
      summary: {
        total: items.length,
        passed,
        failed: items.length - passed,
        pass_rate_pct: Math.round((passed / items.length) * 100),
      },
    };
  }
}


// List Inspections — with offline fallback
export async function listInspections({
  skip = 0,
  limit = 50,
  productId = "",
  productionLine = "",
  reviewStatus = "",
} = {}) {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });

  if (productId) params.set("product_id", productId);
  if (productionLine) params.set("production_line", productionLine);
  if (reviewStatus) params.set("review_status", reviewStatus);

  try {
    return await apiGet(`/api/inspections?${params.toString()}`);
  } catch {
    const mockItems = [
      { id: 1, product_id: "bottle", pass_fail: "Pass", prediction: "Pass", production_line: "line_1", created_at: new Date().toISOString() },
      { id: 2, product_id: "fabric_roll", pass_fail: "Fail", prediction: "Fail", defect_type: "fabric tear", production_line: "line_2", created_at: new Date().toISOString() },
      { id: 3, product_id: "tile_batch", pass_fail: "Fail", prediction: "Fail", defect_type: "surface crack", production_line: "line_1", created_at: new Date().toISOString() },
      { id: 4, product_id: "leather_sheet", pass_fail: "Pass", prediction: "Pass", production_line: "line_3", created_at: new Date().toISOString() },
    ];
    return { items: mockItems, total: mockItems.length };
  }
}

// Single Inspection
export function getInspection(id) {
  return apiGet(`/api/inspections/${id}`);
}

// Update Review Status — with offline fallback
export async function updateReviewStatus(id, reviewStatus, reviewNotes = "") {
  try {
    return await apiPatch(`/api/inspections/${id}/review-status`, {
      review_status: reviewStatus,
      review_notes: reviewNotes,
    });
  } catch {
    return { id, review_status: reviewStatus, rework_ticket_number: `RWT-${Date.now()}` };
  }
}

// Update Metadata
export function updateInspectionMetadata(id, metadata = {}) {
  return apiPatch(`/api/inspections/${id}/metadata`, metadata);
}

// Camera Samples — with offline fallback
export async function getCameraSamples() {
  try {
    return await apiGet("/api/inspections/camera-samples");
  } catch {
    return {
      total: 12,
      labels: { fabric_tear: 3, tile_crack: 3, leather_stain: 3, metal_scratch: 3 },
      demo_controls: [
        { label: "All Samples", value: "" },
        { label: "Fabric Tear", value: "fabric_tear" },
        { label: "Tile Crack", value: "tile_crack" },
        { label: "Leather Stain", value: "leather_stain" },
        { label: "Metal Scratch", value: "metal_scratch" },
      ],
    };
  }
}

// Camera Simulation — with offline fallback
export async function simulateCameraInspection({
  frameIndex = 0,
  label = "",
} = {}) {
  const params = new URLSearchParams({ frame_index: String(frameIndex) });
  if (label) params.set("label", label);

  try {
    return await apiPost(`/api/inspections/camera-simulate?${params.toString()}`, {});
  } catch {
    return mockCameraFrame(frameIndex, label);
  }
}