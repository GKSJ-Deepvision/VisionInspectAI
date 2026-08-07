import { useState } from "react";

export default function ImagePreviewModal({
  inspection,
  onClose,
}) {
  const [zoom, setZoom] = useState(1);

  if (!inspection) return null;

  const imageUrl = `http://127.0.0.1:8000/${inspection.image_path}`;

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = inspection.image_name;
    link.click();
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto relative">

        {/* Close Button */}

        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-3xl font-bold text-gray-500 hover:text-red-600"
        >
          ✕
        </button>

        <div className="p-8">

          <h2 className="text-3xl font-bold mb-8">
            AI Inspection Report
          </h2>

          <div className="grid lg:grid-cols-2 gap-10">

            {/* Image Section */}

            <div>

              <div className="border rounded-xl overflow-hidden bg-gray-100 flex justify-center">

                <img
                  src={imageUrl}
                  alt={inspection.image_name}
                  style={{
                    transform: `scale(${zoom})`,
                    transition: "0.3s",
                  }}
                  className="max-h-[500px] object-contain"
                />

              </div>

              {/* Controls */}

              <div className="flex flex-wrap gap-3 mt-5">

                <button
                  onClick={() => setZoom(zoom + 0.2)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  🔍 Zoom +
                </button>

                <button
                  onClick={() =>
                    setZoom(Math.max(1, zoom - 0.2))
                  }
                  className="bg-orange-500 text-white px-4 py-2 rounded"
                >
                  🔎 Zoom -
                </button>

                <button
                  onClick={() => setZoom(1)}
                  className="bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Reset
                </button>

                <button
                  onClick={downloadImage}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Download
                </button>

                <button
                  onClick={printReport}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  Print
                </button>

              </div>

            </div>

            {/* Report */}

            <div className="space-y-5">

              <div>

                <h3 className="font-semibold text-gray-500">
                  Image
                </h3>

                <p>{inspection.image_name}</p>

              </div>

              <div>

                <h3 className="font-semibold text-gray-500">
                  Prediction
                </h3>

                <span
                  className={`inline-block px-4 py-2 rounded-full text-white font-bold ${
                    inspection.prediction === "GOOD"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {inspection.prediction}
                </span>

              </div>

              <div>

                <h3 className="font-semibold text-gray-500">
                  Confidence
                </h3>

                <p>{inspection.confidence}%</p>

              </div>

              <hr />

              <div>

                <h3 className="font-semibold text-gray-500">
                  Defect Type
                </h3>

                <p>{inspection.defect_type}</p>

              </div>

              <div>

                <h3 className="font-semibold text-gray-500">
                  Severity
                </h3>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-white ${
                    inspection.severity === "CRITICAL"
                      ? "bg-red-700"
                      : inspection.severity === "HIGH"
                      ? "bg-orange-500"
                      : inspection.severity === "MEDIUM"
                      ? "bg-yellow-500"
                      : "bg-green-600"
                  }`}
                >
                  {inspection.severity}
                </span>

              </div>

              <div>

                <h3 className="font-semibold text-gray-500">
                  Risk Score
                </h3>

                <p>{inspection.risk_score}</p>

              </div>

              <div>

                <h3 className="font-semibold text-gray-500">
                  Recommendation
                </h3>

                <p className="font-semibold">
                  {inspection.recommendation}
                </p>

              </div>

              <hr />

              <div>

                <h3 className="font-semibold text-gray-500">
                  Inspection ID
                </h3>

                <p>#{inspection.id}</p>

              </div>

              <div>

                <h3 className="font-semibold text-gray-500">
                  Time
                </h3>

                <p>
                  {new Date(
                    inspection.created_at
                  ).toLocaleString()}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}