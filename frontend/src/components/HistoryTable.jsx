import { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  History,
} from "lucide-react";

import ImagePreviewModal from "./ImagePreviewModal";
import ActionButtons from "./ActionButtons";

export default function HistoryTable({
  history,
  onRefresh,
}) {
  const inspectionHistory = history ?? [];

  const [search, setSearch] = useState("");

  const [predictionFilter, setPredictionFilter] =
    useState("ALL");

  const [severityFilter, setSeverityFilter] =
    useState("ALL");

  const [dateFilter, setDateFilter] =
    useState("");

  const [selectedInspection, setSelectedInspection] =
    useState(null);

  const filtered = inspectionHistory.filter((item) => {

    const matchSearch =
      item.image_name
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchPrediction =
      predictionFilter === "ALL" ||
      item.prediction === predictionFilter;

    const matchSeverity =
      severityFilter === "ALL" ||
      item.severity === severityFilter;

    const matchDate =
      dateFilter === "" ||
      item.created_at.startsWith(dateFilter);

    return (
      matchSearch &&
      matchPrediction &&
      matchSeverity &&
      matchDate
    );
  });

  return (
    <>

      <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">

        {/* Header */}

        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">

              <History size={28} />

            </div>

            <div>

              <h2 className="text-3xl font-bold">
                Inspection History
              </h2>

              <p className="text-gray-500">
                View and manage all AI inspection reports
              </p>

            </div>

          </div>

          {/* Search */}

          <div className="relative">

            <Search
              size={20}
              className="absolute left-4 top-3.5 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search image..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                pl-12
                pr-4
                py-3
                w-80
                border
                rounded-xl
                focus:ring-2
                focus:ring-blue-500
                outline-none
              "
            />

          </div>

        </div>

        {/* Filters */}

        <div className="flex flex-wrap gap-4 mb-8">

          <div className="flex items-center gap-2">

            <Filter size={18} />

            <select
              value={predictionFilter}
              onChange={(e) =>
                setPredictionFilter(e.target.value)
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

          </div>

          <select
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value)
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

          <div className="flex items-center gap-2">

            <Calendar size={18} />

            <input
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
              className="border rounded-xl px-4 py-3"
            />

          </div>

        </div>

        {/* Table */}

        <div className="overflow-x-auto rounded-xl border">

          <table className="w-full">

            <thead className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">

              <tr>

                <th className="p-4 text-left">
                  ID
                </th>

                <th className="p-4 text-left">
                  Image
                </th>

                <th className="p-4 text-left">
                  Prediction
                </th>

                <th className="p-4 text-left">
                  Confidence
                </th>

                <th className="p-4 text-left">
                  Severity
                </th>

                <th className="p-4 text-left">
                  Risk
                </th>

                <th className="p-4 text-left">
                  Time
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="text-center py-16"
                  >

                    <div className="flex flex-col items-center">

                      <div className="text-6xl mb-4">
                        📂
                      </div>

                      <h3 className="text-2xl font-bold text-gray-600">
                        No Inspection Found
                      </h3>

                      <p className="text-gray-400 mt-2">
                        Try changing search or filters.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filtered.map((item) => (

                  <tr
                    key={item.id}
                    className="
                      border-b
                      hover:bg-blue-50
                      transition-all
                      duration-300
                    "
                  >

                    <td className="p-4 font-semibold">
                      #{item.id}
                    </td>

                    <td className="p-4 font-medium">
                      {item.image_name}
                    </td>

                    <td className="p-4">

                      <span
                        className={`px-4 py-1 rounded-full text-white font-semibold ${
                          item.prediction === "GOOD"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {item.prediction}
                      </span>

                    </td>

                    <td className="p-4 font-semibold">

                      {Number(
                        item.confidence
                      ).toFixed(2)}
                      %

                    </td>

                    <td className="p-4">

                      <span
                        className={`px-4 py-1 rounded-full text-white font-semibold ${
                          item.severity === "CRITICAL"
                            ? "bg-red-700"
                            : item.severity === "HIGH"
                            ? "bg-orange-500"
                            : item.severity === "MEDIUM"
                            ? "bg-yellow-500"
                            : "bg-green-600"
                        }`}
                      >
                        {item.severity}
                      </span>

                    </td>

                    <td className="p-4 font-bold">

                      {item.risk_score}

                    </td>

                    <td className="p-4 text-sm">

                      {new Date(
                        item.created_at
                      ).toLocaleString()}

                    </td>

                    <td className="p-4">

                      <ActionButtons
                        inspection={item}
                        onView={() =>
                          setSelectedInspection(item)
                        }
                        onDelete={onRefresh}
                      />

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

        {/* Footer */}

        <div className="flex justify-between items-center mt-6 text-gray-500 text-sm">

          <p>

            Showing

            <span className="font-bold text-blue-600 mx-1">
              {filtered.length}
            </span>

            of

            <span className="font-bold text-blue-600 mx-1">
              {inspectionHistory.length}
            </span>

            inspections

          </p>

          <p>

            VisionInspect AI © 2026

          </p>

        </div>

      </div>

      <ImagePreviewModal
        inspection={selectedInspection}
        onClose={() =>
          setSelectedInspection(null)
        }
      />

    </>

  );

}