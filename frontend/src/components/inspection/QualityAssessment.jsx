import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

export default function QualityAssessment({ result }) {
  if (!result) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-8">
        Quality Assessment
      </h2>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-5">
        <InfoRow
          icon={ShieldCheckIcon}
          iconColor="text-green-400"
          label="Severity Level"
          value={result.severity_level ?? "N/A"}
        />

        <InfoRow
          icon={ExclamationTriangleIcon}
          iconColor="text-yellow-400"
          label="Severity Score"
          value={result.severity_score ?? "N/A"}
        />

        <InfoRow
          icon={Squares2X2Icon}
          iconColor="text-blue-400"
          label="Area Score"
          value={result.area_score ?? "N/A"}
        />

        <InfoRow
          icon={MapPinIcon}
          iconColor="text-purple-400"
          label="Location Score"
          value={result.location_score ?? "N/A"}
        />

        <InfoRow
          icon={WrenchScrewdriverIcon}
          iconColor="text-orange-400"
          label="Type Score"
          value={result.type_score ?? "N/A"}
        />

        <InfoRow
          icon={ClipboardDocumentCheckIcon}
          iconColor="text-cyan-400"
          label="Inspection Status"
          value={result.inspection_status ?? "N/A"}
        />
      </div>

      {/* Recommended Action */}

      <div className="mt-8 rounded-2xl border border-gray-700 bg-gray-800 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/15">
            <span className="text-2xl">⚠</span>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wide text-gray-400">
              Recommended Action
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              {result.recommended_action ?? "N/A"}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  iconColor,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 py-3">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${iconColor}`} />

        <span className="text-gray-300">
          {label}
        </span>
      </div>

      <span className="font-semibold text-white">
        {value}
      </span>
    </div>
  );
}