import { apiGet, getAuthToken } from "./api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const MOCK_ANALYTICS = {
  total_inspections: 248,
  good_count: 214,
  pass_count: 214,
  fail_count: 34,
  average_confidence: 0.944,
  defect_rate_pct: 13.7,
  production_lines: ["line_1", "line_2", "line_3"],
};

export async function getAnalyticsSummary(filters = {}) {
  const params = new URLSearchParams();

  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  if (filters.productionLine)
    params.set("production_line", filters.productionLine);
  if (filters.productId)
    params.set("product_id", filters.productId);

  const query = params.toString();

  try {
    return await apiGet(`/api/analytics/summary${query ? `?${query}` : ""}`);
  } catch {
    return MOCK_ANALYTICS;
  }
}

export async function downloadAnalyticsCsv() {
  const response = await fetch(
    `${API_BASE_URL}/api/analytics/export.csv`,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Could not export analytics CSV");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "visioninspect_inspections.csv";
  link.click();

  URL.revokeObjectURL(url);
}