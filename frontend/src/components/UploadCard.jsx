import { useState } from "react";
import api from "../services/api";

export default function UploadCard({ onPrediction }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);

      const response = await api.post(
  "/inspection/predict",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);



onPrediction(response.data);

    } catch (err) {
      console.error(err);
      alert("Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-5">
        Upload Inspection Image
      </h2>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center">

        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="mx-auto h-64 object-contain rounded-lg"
          />
        ) : (
          <div className="py-12 text-gray-400">
            <div className="text-6xl">🖼️</div>

            <p className="mt-4">
              No image selected
            </p>
          </div>
        )}

      </div>

      <div className="mt-5">

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border rounded-lg p-2"
        />

      </div>

      {selectedFile && (
        <p className="mt-3 text-sm text-gray-600">
          Selected: <strong>{selectedFile.name}</strong>
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
      >
        {loading ? "Predicting..." : "Predict Defect"}
      </button>

    </div>
  );
}