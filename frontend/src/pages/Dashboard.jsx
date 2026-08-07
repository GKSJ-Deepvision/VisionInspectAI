import { useEffect, useState } from "react";
import api from "../services/api";

import Layout from "../components/Layout";
import LoadingScreen from "../components/LoadingScreen";

import StatsCards from "../components/StatsCards";
import QuickActions from "../components/QuickActions";
import SystemStatus from "../components/SystemStatus";
import HistoryTable from "../components/HistoryTable";

export default function Dashboard() {

  const [dashboard, setDashboard] = useState(null);

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {

    try {

      const response =
        await api.get("/inspection/dashboard");

      setDashboard(response.data);

    } catch (error) {

      console.error(error);

    }

  };

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

    const fetchData = async () => {

      setLoading(true);

      await Promise.all([
        loadDashboard(),
        loadHistory(),
      ]);

      setTimeout(() => {

        setLoading(false);

      }, 600);

    };

    fetchData();

  }, []);

  if (loading) {

    return <LoadingScreen />;

  }

  return (

    <Layout>

      <div className="space-y-8">

        {/* Welcome Banner */}

        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700 text-white p-10 shadow-2xl">

          <h1 className="text-5xl font-bold">

            VisionInspect AI

          </h1>

          <p className="text-blue-100 text-lg mt-3">

            Manufacturing Defect Detection & Quality Inspection Platform

          </p>

          <div className="mt-6 flex flex-wrap gap-6">

            <div>

              <p className="text-blue-200">

                Date

              </p>

              <h3 className="font-bold">

                {new Date().toLocaleDateString()}

              </h3>

            </div>

            <div>

              <p className="text-blue-200">

                Time

              </p>

              <h3 className="font-bold">

                {new Date().toLocaleTimeString()}

              </h3>

            </div>

          </div>

        </div>

        {/* Statistics */}

        <StatsCards dashboard={dashboard} />
                {/* Quick Actions */}

        <QuickActions />

        {/* Recent Inspections */}

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-3xl font-bold text-slate-800">

                Recent Inspections

              </h2>

              <p className="text-gray-500 mt-2">

                Last 5 AI inspection records

              </p>

            </div>

          </div>

          <HistoryTable
            history={history.slice(0, 5)}
            onRefresh={() => {
              loadHistory();
              loadDashboard();
            }}
          />

        </div>

        {/* System Status */}

        <SystemStatus />

        {/* Footer */}

        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 shadow-xl">

          <div className="flex flex-col lg:flex-row justify-between items-center">

            <div>

              <h2 className="text-2xl font-bold">

                VisionInspect AI

              </h2>

              <p className="text-slate-300 mt-2">

                Enterprise Manufacturing Quality Inspection Platform

              </p>

            </div>

            <div className="mt-6 lg:mt-0 text-center lg:text-right">

              <p className="text-slate-400">

                System Version

              </p>

              <h3 className="text-2xl font-bold text-cyan-400">

                Enterprise 2.0

              </h3>

            </div>

          </div>

        </div>

      </div>

    </Layout>

  );

}