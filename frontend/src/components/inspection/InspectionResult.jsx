import SummaryCard from "./SummaryCard";
import ImageComparison from "./ImageComparison";
import MetricCards from "./MetricCards";
import QualityAssessment from "./QualityAssessment";
import EmptyState from "../common/EmptyState";

import {
  SparklesIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function InspectionResult({ results }) {
  if (!results || results.length === 0) {
    return (
      <EmptyState
        icon={SparklesIcon}
        title="No Inspection Results"
        description="Upload an image and run AI inspection to see the analysis."
      />
    );
  }

  const result = results[0];

  const handleExport = () => {
    // Replace this with your backend export API later
    window.print();
  };

  return (
    <div
      className={`rounded-3xl border-2 shadow-2xl overflow-hidden transition-all duration-300 ${
        result.status === "Normal"
          ? "border-green-500"
          : "border-red-500"
      }`}
    >
      {/* Header */}

      <div className="bg-gray-900 border-b border-gray-800 px-8 py-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2 className="text-3xl font-bold text-white">
              Inspection Result
            </h2>

            <p className="mt-2 text-gray-400">
              AI-powered Quality Inspection Report
            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={handleExport}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-gray-700
                bg-gray-800
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-gray-700
              "
            >
              <ArrowDownTrayIcon className="h-5 w-5" />

              Export Report
            </button>

            <span
              className={`rounded-full px-6 py-2.5 text-sm font-bold tracking-wide text-white ${
                result.status === "Normal"
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {(result.status || "UNKNOWN").toUpperCase()}
            </span>

          </div>

        </div>

      </div>

    {/* Body */}

<div className="space-y-8 bg-gray-950 p-8">

  {/* Summary + Images */}

  <div className="grid gap-8 xl:grid-cols-5">

    <div className="xl:col-span-2">
      <SummaryCard result={result} />
    </div>

    <div className="xl:col-span-3">
      <ImageComparison
    originalImage={result.preview}
    heatmap={result.heatmap_url}
    status={result.status}
    anomalyScore={result.anomaly_score}
/>
      
    </div>

  </div>

  {/* Metric Cards */}

  <MetricCards result={result} />

  {/* Quality Assessment */}

  <QualityAssessment result={result} />

</div>

    </div>
  );
}