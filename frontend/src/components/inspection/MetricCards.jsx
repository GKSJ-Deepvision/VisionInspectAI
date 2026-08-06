import {
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function MetricCards({ result }) {
  if (!result) return null;

  const inspectionResult = result.inspection_result ?? "N/A";

  const cards = [
    {
      title: "Confidence",
      value:
        result.confidence != null
          ? `${(result.confidence * 100).toFixed(2)} %`
          : "N/A",
      icon: CheckBadgeIcon,
      color: "text-blue-400",
    },
    {
      title: "Severity Score",
      value:
        result.severity_score != null
          ? Number(result.severity_score).toFixed(2)
          : "N/A",
      icon: ExclamationTriangleIcon,
      color: "text-yellow-400",
    },
    {
      title: "Quality Decision",
      value: result.quality_decision ?? "N/A",
      icon: ShieldCheckIcon,
      color: "text-green-400",
    },
    {
      title: "Inspection Result",
      value: inspectionResult,
      icon: ChartBarIcon,
      color:
        inspectionResult === "PASS"
          ? "text-green-400"
          : inspectionResult === "PENDING REVIEW"
          ? "text-yellow-400"
          : "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="
              bg-gray-900
              border
              border-gray-800
              rounded-3xl
              shadow-lg
              p-6
              transition-all
              duration-300
              hover:border-blue-500
              hover:-translate-y-1
            "
          >
            <div className="flex items-center justify-between">
              <Icon className={`h-9 w-9 ${card.color}`} />
            </div>

            <p className="mt-5 text-sm text-gray-400">
              {card.title}
            </p>

            <h2
              className={`mt-3 break-words text-3xl font-bold ${
                card.title === "Inspection Result"
                  ? card.color
                  : "text-white"
              }`}
            >
              {card.value}
            </h2>
          </div>
        );
      })}
    </div>
  );
}