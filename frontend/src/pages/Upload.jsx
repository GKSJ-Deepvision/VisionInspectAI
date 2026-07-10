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

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image");
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

      // Save upload to history
      await axios.post("http://localhost:8000/history", {
        filename: res.data.filename,
        status: "Completed",
        width: res.data.original_width,
        height: res.data.original_height,
        processed_size: res.data.processed_size,
        date: new Date().toLocaleString(),
      });

      // Navigate to Results page
      navigate("/results", {
        state: {
          image: preview,
          result: res.data,
        },
      });
    } catch (error) {
      console.error(error);
      alert("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Upload Image">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#1F2937] rounded-2xl p-8 shadow-lg">
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

                <h2 className="text-2xl font-bold mt-5">
                  Upload Inspection Image
                </h2>

                <p className="text-gray-400 mt-2">
                  Click here to browse image
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

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Upload;