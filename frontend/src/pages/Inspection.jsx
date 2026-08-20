import { useState } from "react";

import Layout from "../components/Layout";
import loginBg from "../assets/login-background.png";
import UploadPanel from "../components/inspection/UploadPanel";
import ImagePreviewGrid from "../components/inspection/ImagePreviewGrid";
import InspectionResult from "../components/inspection/InspectionResult";
import LoadingOverlay from "../components/inspection/LoadingOverlay";

import { useAuth } from "../context/AuthContext";
import { inspectImage } from "../services/api";

export default function Inspection() {

  const { user } = useAuth();

  const [category, setCategory] = useState("bottle");

  const [files, setFiles] = useState([]);

  const [previews, setPreviews] = useState([]);

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");



  function handleFilesSelected(selectedFiles) {

    if (!selectedFiles.length) return;

    const imageFiles = selectedFiles.filter(file =>
      file.type.startsWith("image/")
    );

    setFiles(imageFiles);

    setPreviews(
      imageFiles.map(file => URL.createObjectURL(file))
    );

    setResults([]);

    setError("");

  }



  function removeImage(index) {

    const updatedFiles = [...files];

    const updatedPreviews = [...previews];

    URL.revokeObjectURL(updatedPreviews[index]);

    updatedFiles.splice(index, 1);

    updatedPreviews.splice(index, 1);

    setFiles(updatedFiles);

    setPreviews(updatedPreviews);

  }



  async function startInspection() {

    if (files.length === 0) {

      setError("Please upload at least one image.");

      return;

    }

    if (!user?.token) {

      setError("Please login again.");

      return;

    }

    try {

      setLoading(true);

      setError("");

      const inspectionResults = [];

      for (const file of files) {

        const result = await inspectImage(
          file,
          category,
          user.token
        );

        inspectionResults.push({

          ...result,

          preview: URL.createObjectURL(file),

        });

      }

      setResults(inspectionResults);

    }

    catch (err) {

      console.error(err);

      setError(

        err.message ||

        "Inspection failed."

      );

    }

    finally {

      setLoading(false);

    }

  }
    return (

    <Layout>

      <LoadingOverlay
        show={loading}
      />

      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            `linear-gradient(rgba(5,10,25,.75),rgba(5,10,25,.82)),url(${loginBg})`
        }}
      >

        
        <div className="max-w-[1600px] mx-auto px-6 py-8">

          {/* Header */}

          <div className="mb-10">

            <h1 className="text-4xl font-bold text-white">

              AI Manufacturing Inspection

            </h1>

            <p className="text-gray-400 mt-2">

              Upload product images, run AI inspection and review quality analysis.

            </p>

          </div>

          {/* Upload Section */}

          <div className="grid xl:grid-cols-2 gap-8">

            <UploadPanel

              category={category}

              setCategory={setCategory}

              onFilesSelected={handleFilesSelected}

              onInspect={startInspection}

              loading={loading}

            />

            <ImagePreviewGrid

              files={files}

              previews={previews}

              onRemove={removeImage}

            />

          </div>

          {/* Error */}

          {

            error && (

              <div className="mt-8 rounded-2xl border border-red-500 bg-red-500/10 p-4">

                <p className="text-red-300">

                  {error}

                </p>

              </div>

            )

          }

          {/* Inspection Results */}

          <div className="mt-10">

            <InspectionResult

              results={results}

            />

          </div>

        </div>

      </div>
            </Layout>

  );

}