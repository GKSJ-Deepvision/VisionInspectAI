import { useState } from "react";
import {
  PhotoIcon,
  FireIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ImageComparison({
  originalImage,
  heatmap,
  status, // "Normal" | "Defective"
}) {
  const [preview, setPreview] = useState(null);

  const isClean = status && status.toLowerCase() === "normal";

  const heatmapUrl = heatmap
    ? heatmap.startsWith("http")
      ? heatmap
      : `${BASE_URL}${heatmap}`
    : null;

  return (
    <>
      <div
        className={`rounded-3xl border bg-gray-900 shadow-xl ${
          isClean ? "border-gray-800" : "border-gray-800"
        }`}
      >

        {/* Header */}

        <div className="border-b border-gray-800 px-8 py-6">

          <h2 className="text-2xl font-bold text-white">
            AI Visualization
          </h2>

        </div>

        {/* Images */}

        <div className="grid gap-6 p-6 md:grid-cols-2">

          {/* ORIGINAL */}

          <div className="rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden">

            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">

              <div className="flex items-center gap-3">

                <PhotoIcon className="h-6 w-6 text-blue-400" />

                <span className="font-semibold text-white">
                  Original Image
                </span>

              </div>

              {originalImage && (

                <button
                  onClick={() => setPreview(originalImage)}
                  className="rounded-lg p-2 hover:bg-gray-800 transition"
                >

                  <ArrowsPointingOutIcon className="h-5 w-5 text-gray-400" />

                </button>

              )}

            </div>

            <div className="flex h-[500px] items-center justify-center bg-black p-6">

              {originalImage ? (

                <img
                  src={originalImage}
                  alt="Original"
                  loading="lazy"
                  className="
                    max-h-full
                    max-w-full
                    object-contain
                    object-center
                    transition
                    duration-300
                    hover:scale-105
                    cursor-zoom-in
                  "
                  onClick={() => setPreview(originalImage)}
                />

              ) : (

                <p className="text-gray-500">
                  No Image Available
                </p>

              )}

            </div>

          </div>

          {/* HEATMAP */}

          <div
            className={`rounded-2xl border overflow-hidden bg-gray-950 ${
              isClean ? "border-emerald-900/60" : "border-gray-800"
            }`}
          >

            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">

              <div className="flex items-center gap-3">

                {isClean ? (
                  <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                ) : (
                  <FireIcon className="h-6 w-6 text-red-400" />
                )}

                <span className="font-semibold text-white">
                  {isClean ? "AI Scan Result" : "AI Defect Heatmap"}
                </span>

              </div>

              {heatmapUrl && (

                <button
                  onClick={() => setPreview(heatmapUrl)}
                  className="rounded-lg p-2 hover:bg-gray-800 transition"
                >

                  <ArrowsPointingOutIcon className="h-5 w-5 text-gray-400" />

                </button>

              )}

            </div>

            <div className="relative flex h-[500px] items-center justify-center bg-black p-6">

              {heatmapUrl ? (

                <img
                  src={heatmapUrl}
                  alt={isClean ? "Scan result, no anomalies" : "Heatmap"}
                  loading="lazy"
                  className="
                    max-h-full
                    max-w-full
                    object-contain
                    object-center
                    transition
                    duration-300
                    hover:scale-105
                    cursor-zoom-in
                  "
                  onClick={() => setPreview(heatmapUrl)}
                />

              ) : (

                <p className="text-gray-500">
                  Heatmap Not Available
                </p>

              )}

              {/* Explicit "nothing found" indicator so a clean scan   */}
              {/* doesn't look like a failed/missing heatmap.          */}
              {isClean && heatmapUrl && (

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    bottom-0
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-gradient-to-t
                    from-black/80
                    to-transparent
                    px-4
                    py-4
                  "
                >

                  <CheckCircleIcon className="h-5 w-5 text-emerald-400" />

                  <span className="text-sm font-medium text-emerald-300">
                    No Anomalies Detected
                  </span>

                </div>

              )}

            </div>

          </div>

        </div>

        {/* Shared Legend */}

        {!isClean && (

          <div className="border-t border-gray-800 px-8 py-6">

            <div className="flex items-center justify-between mb-2">

              <span className="text-sm font-medium text-gray-300">
                Heatmap Legend
              </span>

              <span className="text-xs text-gray-500">
                AI Attention Intensity
              </span>

            </div>

            <div className="flex justify-between text-xs text-gray-500 mb-2">

              <span>Low</span>

              <span>Medium</span>

              <span>High</span>

            </div>

            <div
              className="h-3 rounded-full"
              style={{
                background:
                  "linear-gradient(to right,#2563eb,#10b981,#facc15,#ef4444)",
              }}
            />

          </div>

        )}

      </div>

      {/* Fullscreen Preview */}

      {preview && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/90
            p-10
          "
        >

          <button
            onClick={() => setPreview(null)}
            className="
              absolute
              right-8
              top-8
              rounded-full
              bg-gray-800
              p-2
              hover:bg-gray-700
            "
          >

            <XMarkIcon className="h-7 w-7 text-white" />

          </button>

          <img
            src={preview}
            alt="Preview"
            className="
              max-h-[92vh]
              max-w-[92vw]
              object-contain
            "
          />

        </div>

      )}

    </>
  );
}
