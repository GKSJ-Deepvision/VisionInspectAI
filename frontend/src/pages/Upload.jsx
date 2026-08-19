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

  // =========================================================
  // FILE SELECTION
  // =========================================================

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // =========================================================
  // UPLOAD IMAGE
  // =========================================================

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image.");
      return;
    }

    // Get logged-in user
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!username) {
      alert("User session not found. Please login again.");
      navigate("/login");
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

            // Send logged-in user information
            "X-Username": username,
            "X-Role": role || "",
          },
        }
      );

      console.log("Upload response:", res.data);

      if (!res.data.success) {
        alert(
          res.data.message ||
            "Upload failed."
        );
        return;
      }

      // =====================================================
      // GO TO RESULTS
      // =====================================================

      navigate("/results", {
        state: {

          originalImage:
            preview,

          result:
            res.data,

          processedImage:
            `http://localhost:8000/processed/${res.data.filename}?t=${Date.now()}`,

        },
      });

    } catch (error) {

      console.error(
        "Upload error:",
        error
      );

      if (error.response) {

        alert(
          error.response.data?.message ||
            "Upload Failed"
        );

      } else {

        alert(
          "Backend is not running."
        );
      }

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Layout title="Upload Image">

      <div className="max-w-3xl mx-auto">

        <div className="bg-[#1F2937] rounded-2xl p-8 shadow-lg">

          {/* =================================================
              UPLOAD AREA
          ================================================= */}

          <label
            htmlFor="fileInput"
            className="border-2 border-dashed border-emerald-500 rounded-xl h-80 flex flex-col justify-center items-center cursor-pointer hover:border-emerald-400 transition relative overflow-hidden"
          >

            {preview ? (

              <div className="relative h-64 w-full flex justify-center items-center">

                {/* PREVIEW */}

                <img
                  src={preview}
                  alt="Preview"
                  className="h-64 max-w-full object-contain rounded-xl"
                />

                {/* =================================================
                    AI SCANNING ANIMATION
                ================================================= */}

                {loading && (

                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">

                    {/* Scanning Glow */}

                    <div className="absolute left-0 right-0 top-0 h-16 bg-gradient-to-b from-emerald-400/30 via-emerald-400/10 to-transparent animate-scan-glow" />

                    {/* Scanning Line */}

                    <div className="absolute left-0 right-0 top-0 h-1 bg-emerald-400 shadow-[0_0_15px_5px_rgba(52,211,153,0.7)] animate-scan" />

                  </div>

                )}

                {/* =================================================
                    SCANNING INDICATOR
                ================================================= */}

                {loading && (

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-400/40">

                    <div className="flex items-center gap-2">

                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />

                      <span className="text-emerald-400 text-sm font-semibold tracking-wide">
                        AI Scanning...
                      </span>

                    </div>

                  </div>

                )}

              </div>

            ) : (

              <>
                {/* UPLOAD ICON */}

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
              disabled={loading}
            />

          </label>

          {/* =================================================
              FILE NAME
          ================================================= */}

          {selectedFile && (

            <p className="text-center text-gray-300 mt-4">

              Selected File:

              <span className="text-emerald-400 font-medium">

                {" "}

                {selectedFile.name}

              </span>

            </p>

          )}

          {/* =================================================
              UPLOAD BUTTON
          ================================================= */}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {loading
              ? "Analyzing Image..."
              : "Upload Image"}

          </button>

        </div>

      </div>

    </Layout>
  );
}

export default Upload;