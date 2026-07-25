import { useState } from "react";
import API from "../services/auth";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await API.post("/upload/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(response.data.message);
    } catch (error) {
      setMessage("Upload failed.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white p-8 rounded-xl shadow-lg w-[500px]">

        <h1 className="text-3xl font-bold text-center mb-6">
          Upload Image
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="mb-5"
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="rounded-lg mb-5 w-full h-72 object-contain border"
          />
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>

        {message && (
          <p className="mt-4 text-center font-semibold">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}