import { useEffect, useState } from "react";
import api from "../services/api";

import Navbar from "../components/Navbar";

import StatsCards from "../components/StatsCards";
import AnalyticsChart from "../components/AnalyticsChart";
import ConfidenceChart from "../components/ConfidenceChart";
import UploadCard from "../components/UploadCard";
import PredictionCard from "../components/PredictionCard";
import HistoryTable from "../components/HistoryTable";

export default function Dashboard() {
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const response = await api.get("/inspection/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handlePrediction = (result) => {
    setPrediction(result);
    loadHistory();
  };

  return (
    <>
      {/* Navigation Bar */}
      <Navbar />

      <div className="min-h-screen bg-gray-100">

        {/* Header */}
        <div className="bg-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <h1 className="text-4xl font-bold">
              VisionInspect AI
            </h1>

            <p className="text-blue-100 mt-2">
              AI Manufacturing Defect Detection & Quality Inspection System
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-8">

          {/* Statistics */}
          <StatsCards history={history} />

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            <AnalyticsChart history={history} />
            <ConfidenceChart history={history} />
          </div>

          {/* Upload & Prediction */}
          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            <UploadCard
              onPrediction={handlePrediction}
            />

            <PredictionCard
              prediction={prediction}
            />
          </div>

          {/* Inspection History */}
          <HistoryTable history={history} />

        </div>
      </div>
    </>
  );
}