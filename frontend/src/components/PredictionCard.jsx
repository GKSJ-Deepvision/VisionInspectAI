import {
  CheckCircle,
  XCircle,
  ShieldAlert,
  Gauge,
  FileWarning,
  Clock,
  Image as ImageIcon,
  Hash,
} from "lucide-react";

export default function PredictionCard({ prediction }) {

  if (!prediction) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">

        <h2 className="text-2xl font-bold mb-6">
          🤖 AI Inspection Report
        </h2>

        <div className="flex flex-col justify-center items-center h-80">

          <div className="text-7xl mb-5 animate-pulse">
            🤖
          </div>

          <p className="text-xl font-semibold text-gray-500">
            No Inspection Yet
          </p>

          <p className="text-gray-400 mt-2">
            Upload an image to start AI inspection.
          </p>

        </div>

      </div>
    );
  }

  const isGood = prediction.prediction === "GOOD";

  return (

    <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">

      <div className="flex justify-between items-center mb-8">

        <h2 className="text-2xl font-bold">
          🤖 AI Inspection Report
        </h2>

        <span
          className={`px-5 py-2 rounded-full text-white font-bold ${
            isGood
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {isGood ? "✔ PASS" : "✖ FAIL"}
        </span>

      </div>

      {/* Confidence */}

      <div className="mb-8">

        <div className="flex justify-between mb-2">

          <span className="font-semibold">
            Confidence
          </span>

          <span className="font-bold">
            {Number(prediction.confidence).toFixed(2)}%
          </span>

        </div>

        <div className="w-full bg-gray-200 rounded-full h-4">

          <div
            className={`h-4 rounded-full transition-all duration-700 ${
              isGood
                ? "bg-green-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${prediction.confidence}%`,
            }}
          />

        </div>

      </div>

      {/* Information */}

      <div className="space-y-4">

        <Info
          icon={<ImageIcon size={20} />}
          title="Image"
          value={prediction.image_name}
        />

        <Info
          icon={<FileWarning size={20} />}
          title="Defect Type"
          value={prediction.defect_type}
        />

        <Info
          icon={<ShieldAlert size={20} />}
          title="Severity"
          value={prediction.severity}
        />

        <Info
          icon={<Gauge size={20} />}
          title="Risk Score"
          value={prediction.risk_score}
        />

        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">

          <h3 className="font-semibold text-blue-700 mb-2">
            💡 Recommendation
          </h3>

          <p className="text-gray-700">
            {prediction.recommendation}
          </p>

        </div>

        <Info
          icon={<Hash size={20} />}
          title="Inspection ID"
          value={`#${prediction.id}`}
        />

        <Info
          icon={<Clock size={20} />}
          title="Inspection Time"
          value={new Date(
            prediction.created_at
          ).toLocaleString()}
        />

      </div>

    </div>

  );

}

function Info({ icon, title, value }) {

  return (

    <div className="flex justify-between items-center border rounded-xl p-4 hover:bg-gray-50 transition">

      <div className="flex items-center gap-3">

        <div className="text-blue-600">
          {icon}
        </div>

        <span className="font-semibold">
          {title}
        </span>

      </div>

      <span className="font-bold text-gray-700">
        {value}
      </span>

    </div>

  );

}