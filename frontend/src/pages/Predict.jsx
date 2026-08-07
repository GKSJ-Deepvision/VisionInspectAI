import { useState } from "react";

import Layout from "../components/Layout";
import UploadCard from "../components/UploadCard";
import PredictionCard from "../components/PredictionCard";

export default function Predict() {

  const [prediction, setPrediction] = useState(null);

  const handlePrediction = (result) => {

    setPrediction(result);

  };

  return (

    <Layout>

      <div className="space-y-8">

        {/* Header */}

        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 p-8 text-white shadow-xl">

          <h1 className="text-4xl font-bold">

            AI Defect Prediction

          </h1>

          <p className="mt-3 text-blue-100 text-lg">

            Upload a manufacturing product image and let VisionInspect AI
            automatically detect defects, estimate confidence, calculate
            severity and generate quality recommendations.

          </p>

        </div>

        {/* Info Cards */}

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h3 className="text-lg font-bold text-slate-800">

              Smart Detection

            </h3>

            <p className="text-gray-500 mt-2">

              AI automatically detects manufacturing defects from uploaded
              product images.

            </p>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h3 className="text-lg font-bold text-slate-800">

              Quality Inspection

            </h3>

            <p className="text-gray-500 mt-2">

              Get confidence score, severity level and quality decision in
              seconds.

            </p>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h3 className="text-lg font-bold text-slate-800">

              Production Ready

            </h3>

            <p className="text-gray-500 mt-2">

              Designed for real-time manufacturing inspection workflows.

            </p>

          </div>

        </div>
                {/* Prediction Section */}

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Upload Card */}

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition duration-300">

            <UploadCard
              onPrediction={handlePrediction}
            />

          </div>

          {/* Prediction Result */}

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition duration-300">

            <PredictionCard
              prediction={prediction}
            />

          </div>

        </div>

        {/* Footer */}

        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h3 className="text-xl font-bold text-slate-800 mb-3">

            Inspection Workflow

          </h3>

          <div className="grid md:grid-cols-4 gap-5">

            <div className="text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">

                1

              </div>

              <p className="mt-3 font-semibold">

                Upload Image

              </p>

            </div>

            <div className="text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-cyan-600 text-white flex items-center justify-center text-xl font-bold">

                2

              </div>

              <p className="mt-3 font-semibold">

                AI Analysis

              </p>

            </div>

            <div className="text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">

                3

              </div>

              <p className="mt-3 font-semibold">

                Detect Defects

              </p>

            </div>

            <div className="text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold">

                4

              </div>

              <p className="mt-3 font-semibold">

                Generate Report

              </p>

            </div>

          </div>

        </div>

      </div>

    </Layout>

  );

}