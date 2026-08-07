import { useEffect, useState } from "react";
import api from "../services/api";

import Layout from "../components/Layout";

import AnalyticsChart from "../components/AnalyticsChart";
import ConfidenceChart from "../components/ConfidenceChart";
import TrendChart from "../components/TrendChart";
import SeverityChart from "../components/SeverityChart";
import DefectTypeChart from "../components/DefectTypeChart";

import {
  BarChart3,
  TrendingUp,
  Activity,
  ShieldCheck,
  Brain,
  AlertCircle,
} from "lucide-react";

export default function Analytics() {

  const [history, setHistory] = useState([]);

  const [predictionFilter, setPredictionFilter] =
    useState("ALL");

  const [severityFilter, setSeverityFilter] =
    useState("ALL");

  const [defectFilter, setDefectFilter] =
    useState("ALL");

  const loadHistory = async () => {

    try {

      const response =
        await api.get("/inspection/history");

      setHistory(response.data);

    } catch (error) {

      console.error(error);

    }

  };

  useEffect(() => {

    loadHistory();

  }, []);

  const filteredHistory = history.filter((item) => {

    const predictionMatch =
      predictionFilter === "ALL" ||
      item.prediction === predictionFilter;

    const severityMatch =
      severityFilter === "ALL" ||
      item.severity === severityFilter;

    const defectMatch =
      defectFilter === "ALL" ||
      item.defect_type === defectFilter;

    return (
      predictionMatch &&
      severityMatch &&
      defectMatch
    );

  });

  const avgConfidence =
    filteredHistory.length > 0
      ? (
          filteredHistory.reduce(
            (sum, item) =>
              sum +
              Number(item.confidence || 0),
            0
          ) / filteredHistory.length
        ).toFixed(1)
      : 0;

  const criticalCount =
    filteredHistory.filter(
      item =>
        item.severity === "CRITICAL"
    ).length;

  return (

    <Layout>

      <div className="space-y-8">

        {/* Header */}

        <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white p-8 shadow-xl">

          <h1 className="text-4xl font-bold">

            Analytics Dashboard

          </h1>

          <p className="mt-3 text-blue-100 text-lg">

            Real-time AI powered manufacturing analytics and production insights.

          </p>

        </div>

        {/* Filters */}

        <div className="bg-white rounded-3xl shadow-xl p-6">

          <div className="flex flex-wrap gap-4">

            <select
              value={predictionFilter}
              onChange={(e) =>
                setPredictionFilter(
                  e.target.value
                )
              }
              className="border rounded-xl px-4 py-3"
            >

              <option value="ALL">
                All Predictions
              </option>

              <option value="GOOD">
                GOOD
              </option>

              <option value="DEFECT">
                DEFECT
              </option>

            </select>

            <select
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(
                  e.target.value
                )
              }
              className="border rounded-xl px-4 py-3"
            >

              <option value="ALL">
                All Severity
              </option>

              <option value="LOW">
                LOW
              </option>

              <option value="MEDIUM">
                MEDIUM
              </option>

              <option value="HIGH">
                HIGH
              </option>

              <option value="CRITICAL">
                CRITICAL
              </option>

            </select>

            <select
              value={defectFilter}
              onChange={(e) =>
                setDefectFilter(
                  e.target.value
                )
              }
              className="border rounded-xl px-4 py-3"
            >

              <option value="ALL">
                All Defect Types
              </option>

              <option value="Scratch">
                Scratch
              </option>

              <option value="Dent">
                Dent
              </option>

              <option value="Crack">
                Crack
              </option>

              <option value="Hole">
                Hole
              </option>

            </select>

          </div>

        </div>

        {/* KPI Cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <Activity
              className="text-blue-600 mb-4"
              size={34}
            />

            <p className="text-gray-500">

              Total

            </p>

            <h2 className="text-3xl font-bold">

              {filteredHistory.length}

            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <ShieldCheck
              className="text-green-600 mb-4"
              size={34}
            />

            <p className="text-gray-500">

              Good

            </p>

            <h2 className="text-3xl font-bold">

              {
                filteredHistory.filter(
                  h =>
                    h.prediction === "GOOD"
                ).length
              }

            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <BarChart3
              className="text-red-600 mb-4"
              size={34}
            />

            <p className="text-gray-500">

              Defects

            </p>

            <h2 className="text-3xl font-bold">

              {
                filteredHistory.filter(
                  h =>
                    h.prediction === "DEFECT"
                ).length
              }

            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <TrendingUp
              className="text-cyan-600 mb-4"
              size={34}
            />

            <p className="text-gray-500">

              Success Rate

            </p>

            <h2 className="text-3xl font-bold">

              {filteredHistory.length === 0
                ? 0
                : (
                    filteredHistory.filter(
                      h =>
                        h.prediction ===
                        "GOOD"
                    ).length /
                    filteredHistory.length *
                    100
                  ).toFixed(1)}
              %

            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <Brain
              className="text-indigo-600 mb-4"
              size={34}
            />

            <p className="text-gray-500">

              Avg Confidence

            </p>

            <h2 className="text-3xl font-bold">

              {avgConfidence}%

            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <AlertCircle
              className="text-orange-600 mb-4"
              size={34}
            />

            <p className="text-gray-500">

              Critical

            </p>

            <h2 className="text-3xl font-bold">

              {criticalCount}

            </h2>

          </div>

        </div>
        ```jsx
        {/* Main Analytics */}

        <div className="grid lg:grid-cols-2 gap-8">

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition duration-300">

            <h2 className="text-2xl font-bold text-slate-800 mb-5">

              Manufacturing Analytics

            </h2>

            <AnalyticsChart history={filteredHistory} />

          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition duration-300">

            <h2 className="text-2xl font-bold text-slate-800 mb-5">

              Confidence Analysis

            </h2>

            <ConfidenceChart history={filteredHistory} />

          </div>

        </div>

        {/* Trend Analysis */}

        <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition duration-300">

          <h2 className="text-2xl font-bold text-slate-800 mb-6">

            Inspection Trend

          </h2>

          <TrendChart history={filteredHistory} />

        </div>

        {/* Bottom Charts */}

        <div className="grid lg:grid-cols-2 gap-8">

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition duration-300">

            <h2 className="text-2xl font-bold text-slate-800 mb-6">

              Severity Distribution

            </h2>

            <SeverityChart history={filteredHistory} />

          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition duration-300">

            <h2 className="text-2xl font-bold text-slate-800 mb-6">

              Defect Type Distribution

            </h2>

            <DefectTypeChart history={filteredHistory} />

          </div>

        </div>

        {/* Analytics Summary */}

        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700 text-white p-8 shadow-2xl">

          <h2 className="text-3xl font-bold">

            Analytics Summary

          </h2>

          <p className="mt-4 text-blue-100 leading-8">

            VisionInspect AI provides intelligent manufacturing analytics
            through AI-based defect detection, confidence evaluation,
            severity analysis, defect distribution, production trends,
            and quality monitoring. These insights help manufacturers
            improve product quality, reduce defects, optimize production,
            and support faster decision making.

          </p>

        </div>

        {/* Footer */}

        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 shadow-xl">

          <div className="flex flex-col lg:flex-row justify-between items-center">

            <div>

              <h2 className="text-2xl font-bold">

                VisionInspect AI Analytics

              </h2>

              <p className="text-slate-300 mt-2">

                Enterprise Manufacturing Quality Analytics Platform

              </p>

            </div>

            <div className="mt-6 lg:mt-0 text-center">

              <p className="text-slate-400">

                Last Updated

              </p>

              <h3 className="text-xl font-bold text-cyan-400">

                {new Date().toLocaleString()}

              </h3>

            </div>

          </div>

        </div>

      </div>

    </Layout>

  );

}
