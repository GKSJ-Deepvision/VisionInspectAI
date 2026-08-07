import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

import {
  Upload,
  Image,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function UploadCard({
  onPrediction,
}) {

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    setPreview(URL.createObjectURL(file));

    toast.success("Image Selected");

  };

  const handleDrop = (e) => {

    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (!file) return;

    setSelectedFile(file);

    setPreview(URL.createObjectURL(file));

    toast.success("Image Dropped Successfully");

  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {

    if (!selectedFile) {

      toast.error("Please Select an Image");

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
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      onPrediction(response.data);

      toast.success(
        "Inspection Completed Successfully!"
      );

    } catch (err) {

      console.error(err);

      toast.error("Prediction Failed");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="bg-white rounded-3xl shadow-xl p-8">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex justify-center items-center text-white">

          <Upload size={28} />

        </div>

        <div>

          <h2 className="text-2xl font-bold">

            Upload Inspection Image

          </h2>

          <p className="text-gray-500">

            Upload a product image for AI inspection

          </p>

        </div>

      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="
          border-2
          border-dashed
          border-blue-300
          rounded-2xl
          p-8
          text-center
          hover:border-blue-600
          transition
        "
      >

        {preview ? (

          <img
            src={preview}
            alt="Preview"
            className="mx-auto h-72 rounded-xl object-contain"
          />

        ) : (

          <div className="py-10">

            <Image
              size={70}
              className="mx-auto text-blue-500"
            />

            <h3 className="mt-4 text-xl font-semibold">

              Drag & Drop Image

            </h3>

            <p className="text-gray-500 mt-2">

              or click below to browse

            </p>

          </div>

        )}

      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full border rounded-xl mt-5 p-3"
      />

      {selectedFile && (

        <div className="mt-5 bg-green-50 rounded-xl p-4 flex items-center gap-3">

          <CheckCircle
            size={24}
            className="text-green-600"
          />

          <div>

            <p className="font-semibold">

              {selectedFile.name}

            </p>

            <p className="text-sm text-gray-500">

              {(selectedFile.size / 1024).toFixed(2)} KB

            </p>

          </div>

        </div>

      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="
          mt-6
          w-full
          bg-gradient-to-r
          from-blue-600
          to-cyan-500
          hover:from-blue-700
          hover:to-cyan-600
          text-white
          py-4
          rounded-xl
          font-semibold
          transition
          flex
          justify-center
          items-center
          gap-2
          disabled:opacity-60
        "
      >

        {loading ? (

          <>

            <Loader2
              size={22}
              className="animate-spin"
            />

            AI Inspecting...

          </>

        ) : (

          <>

            <Upload size={20} />

            Predict Defect

          </>

        )}

      </button>

    </div>

  );

}