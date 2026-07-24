import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { UploadCloud } from "lucide-react";

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ============================
  // File Selection
  // ============================

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Allow only image files
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ============================
  // Upload Image
  // ============================

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      navigate("/results", {
        state: {
          image: preview,
          result: res.data,

          // Processed image URL
          processedImage: `http://localhost:8000/processed/${res.data.filename}`,
        },
      });
    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.message || "Upload Failed");
      } else {
        alert("Backend is not running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Upload Image">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#1F2937] rounded-2xl p-8 shadow-lg">

          {/* Upload Area */}

          <label
            htmlFor="fileInput"
            className="border-2 border-dashed border-emerald-500 rounded-xl h-80 flex flex-col justify-center items-center cursor-pointer hover:border-emerald-400 transition"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-64 object-contain rounded-xl"
              />
            ) : (
              <>
                <UploadCloud
                  size={70}
                  className="text-emerald-400"
                />

                <h2 className="text-2xl font-bold mt-5 text-white">
                  Upload Inspection Image
                </h2>

                <p className="text-gray-400 mt-2">
                  Click here to browse image
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Supported: JPG, JPEG, PNG
                </p>
              </>
            )}

            <input
              id="fileInput"
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </label>

          {/* File Name */}

          {selectedFile && (
            <p className="text-center text-gray-300 mt-4">
              Selected File:
              <span className="text-emerald-400 font-medium">
                {" "}
                {selectedFile.name}
              </span>
            </p>
          )}

          {/* Upload Button */}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing Image..." : "Upload Image"}
          </button>

        </div>
      </div>
    </Layout>
  );
}

export default Upload;