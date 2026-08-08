import {
  HashtagIcon,
  PhotoIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import StatusBadge from "./StatusBadge";

function displayFilename(filename) {
  if (!filename) return "N/A";

  const parts = filename.split("_");

  if (parts.length > 1) {
    return parts[parts.length - 1];
  }

  return filename;
}

export default function SummaryCard({ result }) {
  if (!result) return null;

  const created = result.created_at
    ? new Date(result.created_at)
    : new Date();

  const inspectionDate = created.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const inspectionTime = created.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="h-full rounded-3xl border border-gray-800 bg-gray-900 shadow-xl p-7">

      <h2 className="text-2xl font-bold text-white mb-8">
        Inspection Summary
      </h2>

      <div className="space-y-1">

        <InfoRow
          icon={<HashtagIcon className="h-5 w-5 text-pink-400" />}
          label="Inspection ID"
          value={`INSP-${String(result.id ?? 1).padStart(6, "0")}`}
        />

        <InfoRow
          icon={<PhotoIcon className="h-5 w-5 text-blue-400" />}
          label="Image Name"
          value={displayFilename(result.image_name)}
          tooltip={result.image_name}
        />

        <InfoRow
          icon={<CubeIcon className="h-5 w-5 text-indigo-400" />}
          label="Category"
          value={
            result.category
              ?.replaceAll("_", " ")
              ?.toUpperCase() || "N/A"
          }
        />

        <div className="flex items-center justify-between border-b border-gray-800 py-3">

          <div className="flex items-center gap-3 w-40">

            <ShieldCheckIcon className="h-5 w-5 text-green-400" />

            <span className="text-gray-300">
              Status
            </span>

          </div>

          <StatusBadge status={result.status} />

        </div>

        <InfoRow
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-red-400" />}
          label="Defect"
          value={result.defect ?? "None"}
        />

        <InfoRow
          icon={<CheckBadgeIcon className="h-5 w-5 text-cyan-400" />}
          label="Confidence"
          value={
            result.confidence != null
              ? `${(result.confidence * 100).toFixed(2)}%`
              : "N/A"
          }
        />

        <InfoRow
          icon={<SparklesIcon className="h-5 w-5 text-yellow-400" />}
          label="Anomaly Score"
          value={
            result.anomaly_score != null
              ? Number(result.anomaly_score).toFixed(4)
              : "N/A"
          }
        />

        <InfoRow
          icon={<CalendarDaysIcon className="h-5 w-5 text-emerald-400" />}
          label="Inspection Date"
          value={inspectionDate}
        />

        <InfoRow
          icon={<ClockIcon className="h-5 w-5 text-orange-400" />}
          label="Inspection Time"
          value={inspectionTime}
        />

      </div>

    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  tooltip,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-800 py-3">

      <div className="flex items-center gap-3 w-40 flex-shrink-0">

        {icon}

        <span className="text-gray-300 whitespace-nowrap">
          {label}
        </span>

      </div>

      <span
        title={tooltip || value}
        className="
          flex-1
          text-right
          font-semibold
          text-white
          truncate
        "
      >
        {value}
      </span>

    </div>
  );
}