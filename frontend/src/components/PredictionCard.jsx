export default function PredictionCard({ prediction }) {
  if (!prediction) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          Prediction Result
        </h2>

        <div className="flex flex-col items-center justify-center h-72 text-gray-400">
          <div className="text-6xl mb-4">🤖</div>
          <p>No prediction available.</p>
          <p className="text-sm">
            Upload an image to start inspection.
          </p>
        </div>
      </div>
    );
  }

  const isGood = prediction.prediction === "GOOD";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">
        Prediction Result
      </h2>

      <div className="space-y-5">

        <div>
          <h3 className="font-semibold text-gray-600">Image</h3>
          <p>{prediction.image_name}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-600">Prediction</h3>

          <span
            className={`inline-block mt-2 px-4 py-2 rounded-full text-white font-bold ${
              isGood ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {prediction.prediction}
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-gray-600">Confidence</h3>

          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className={`h-4 rounded-full ${
                isGood ? "bg-green-500" : "bg-red-500"
              }`}
              style={{
                width: `${prediction.confidence}%`,
              }}
            />
          </div>

          <p className="mt-2 font-bold">
            {prediction.confidence}%
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-600">Inspection ID</h3>
          <p>#{prediction.id}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-600">Time</h3>
          <p>{new Date(prediction.created_at).toLocaleString()}</p>
        </div>

      </div>
    </div>
  );
}