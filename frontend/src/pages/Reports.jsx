import { useEffect, useState } from "react";
import api from "../services/api";

import Layout from "../components/Layout";

import ExportReport from "../components/ExportReport";
import ExportCSV from "../components/ExportCSV";
import ExportExcel from "../components/ExportExcel";

import {
  FileText,
  FileSpreadsheet,
  FileDown,
  BarChart3,
} from "lucide-react";

export default function Reports() {

  const [history, setHistory] = useState([]);

  const [dashboard, setDashboard] = useState(null);

  const loadData = async () => {

    try {

      const historyResponse =
        await api.get("/inspection/history");

      const dashboardResponse =
        await api.get("/inspection/dashboard");

      setHistory(historyResponse.data);

      setDashboard(dashboardResponse.data);

    } catch (error) {

      console.error(error);

    }

  };

  useEffect(() => {

    loadData();

  }, []);

  return (

    <Layout>

      <div className="space-y-8">

        {/* Header */}

        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white p-8 shadow-xl">

          <h1 className="text-4xl font-bold">

            Reports Center

          </h1>

          <p className="mt-3 text-emerald-100 text-lg">

            Export AI inspection reports in multiple formats.

          </p>

        </div>

        {/* Summary */}

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500">

                  Reports

                </p>

                <h2 className="text-3xl font-bold mt-2">

                  {history.length}

                </h2>

              </div>

              <FileText
                size={42}
                className="text-blue-600"
              />

            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500">

                  Good

                </p>

                <h2 className="text-3xl font-bold mt-2">

                  {dashboard?.good_products || 0}

                </h2>

              </div>

              <BarChart3
                size={42}
                className="text-green-600"
              />

            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500">

                  Defective

                </p>

                <h2 className="text-3xl font-bold mt-2">

                  {dashboard?.defective_products || 0}

                </h2>

              </div>

              <FileDown
                size={42}
                className="text-red-600"
              />

            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500">

                  Quality

                </p>

                <h2 className="text-3xl font-bold mt-2">

                  {dashboard?.quality_percentage || 0}%

                </h2>

              </div>

              <FileSpreadsheet
                size={42}
                className="text-cyan-600"
              />

            </div>

          </div>

        </div>
                {/* Export Section */}

        <div className="grid lg:grid-cols-3 gap-8">

          {/* PDF */}

          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition">

            <div className="flex items-center gap-3 mb-5">

              <FileText
                size={32}
                className="text-red-600"
              />

              <h2 className="text-2xl font-bold">

                PDF Report

              </h2>

            </div>

            <p className="text-gray-500 mb-6">

              Generate a professional inspection report in PDF format.

            </p>

            <ExportReport
              history={history}
              dashboard={dashboard}
            />

          </div>

          {/* CSV */}

          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition">

            <div className="flex items-center gap-3 mb-5">

              <FileDown
                size={32}
                className="text-blue-600"
              />

              <h2 className="text-2xl font-bold">

                CSV Report

              </h2>

            </div>

            <p className="text-gray-500 mb-6">

              Export all inspection records as CSV.

            </p>

            <ExportCSV
              history={history}
            />

          </div>

          {/* Excel */}

          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition">

            <div className="flex items-center gap-3 mb-5">

              <FileSpreadsheet
                size={32}
                className="text-green-600"
              />

              <h2 className="text-2xl font-bold">

                Excel Report

              </h2>

            </div>

            <p className="text-gray-500 mb-6">

              Export inspection data as Excel spreadsheet.

            </p>

            <ExportExcel
              history={history}
            />

          </div>

        </div>

        {/* Report Information */}

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-2xl font-bold text-slate-800 mb-6">

            Report Summary

          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <p className="text-gray-500">

                Generated On

              </p>

              <h3 className="text-xl font-bold mt-2">

                {new Date().toLocaleString()}

              </h3>

            </div>

            <div>

              <p className="text-gray-500">

                Total Available Reports

              </p>

              <h3 className="text-xl font-bold mt-2">

                {history.length}

              </h3>

            </div>

            <div>

              <p className="text-gray-500">

                Report Formats

              </p>

              <h3 className="text-xl font-bold mt-2">

                PDF • CSV • Excel

              </h3>

            </div>

            <div>

              <p className="text-gray-500">

                System

              </p>

              <h3 className="text-xl font-bold mt-2">

                VisionInspect AI v2.0

              </h3>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 shadow-xl">

          <div className="flex flex-col md:flex-row justify-between items-center">

            <div>

              <h2 className="text-2xl font-bold">

                VisionInspect AI Reports

              </h2>

              <p className="text-slate-300 mt-2">

                Download professional inspection reports anytime.

              </p>

            </div>

            <div className="mt-5 md:mt-0 text-center">

              <p className="text-slate-400">

                Version

              </p>

              <h3 className="text-xl font-bold text-cyan-400">

                2.0 Enterprise

              </h3>

            </div>

          </div>

        </div>

      </div>

    </Layout>

  );

}