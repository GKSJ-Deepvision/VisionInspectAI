import { useEffect, useState } from "react";
import api from "../services/api";

import Layout from "../components/Layout";
import HistoryTable from "../components/HistoryTable";

import {
  History,
  Database,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function HistoryPage() {

  const [history, setHistory] = useState([]);

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

  return (

    <Layout>

      <div className="space-y-8">

        {/* Header */}

        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white p-8 shadow-xl">

          <h1 className="text-4xl font-bold">

            Inspection History

          </h1>

          <p className="mt-3 text-blue-100 text-lg">

            Browse every inspection performed by VisionInspect AI.

          </p>

        </div>

        {/* Summary Cards */}

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">

                  Total Records

                </p>

                <h2 className="text-3xl font-bold mt-2">

                  {history.length}

                </h2>

              </div>

              <Database
                size={42}
                className="text-blue-600"
              />

            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">

                  Good Products

                </p>

                <h2 className="text-3xl font-bold mt-2">

                  {
                    history.filter(
                      (item) =>
                        item.prediction === "GOOD"
                    ).length
                  }

                </h2>

              </div>

              <ShieldCheck
                size={42}
                className="text-green-600"
              />

            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">

                  Defective

                </p>

                <h2 className="text-3xl font-bold mt-2">

                  {
                    history.filter(
                      (item) =>
                        item.prediction === "DEFECT"
                    ).length
                  }

                </h2>

              </div>

              <AlertTriangle
                size={42}
                className="text-red-600"
              />

            </div>

          </div>

        </div>
                {/* History Table */}

        <div className="bg-white rounded-3xl shadow-xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <History
              size={28}
              className="text-blue-600"
            />

            <h2 className="text-2xl font-bold text-slate-800">

              Inspection Records

            </h2>

          </div>

          <HistoryTable
            history={history}
            onRefresh={loadHistory}
          />

        </div>

        {/* Footer */}

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">

          <div className="flex flex-col md:flex-row justify-between items-center">

            <div>

              <h3 className="text-xl font-bold">

                VisionInspect AI

              </h3>

              <p className="text-slate-300 mt-2">

                Manufacturing Defect Detection & Quality Inspection System

              </p>

            </div>

            <div className="text-right mt-4 md:mt-0">

              <p className="text-slate-300">

                Total Inspections

              </p>

              <p className="text-3xl font-bold text-cyan-400">

                {history.length}

              </p>

            </div>

          </div>

        </div>

      </div>

    </Layout>

  );

}