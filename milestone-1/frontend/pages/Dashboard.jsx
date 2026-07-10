import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  BadgePercent,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_inspected: 0,
    defects_detected: 0,
    pass_rate: 100.0,
    yield_target: 95.0,
  });

  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data.stats);
        setRecentInspections(response.data.recent_inspections);
      } catch (err) {
        console.error(err);
        setError(
          'Could not retrieve dashboard statistics. Ensure backend is running.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: 'Total Inspected',
      value: stats.total_inspected,
      change: 'Lifetime inspected count',
      icon: Activity,
      color: 'text-indigo-400',
    },
    {
      label: 'Defects Detected',
      value: stats.defects_detected,
      change: 'Anomalous items count',
      icon: AlertTriangle,
      color: 'text-amber-400',
    },
    {
      label: 'Pass Rate',
      value: `${stats.pass_rate}%`,
      change: 'Completed pass percentage',
      icon: ShieldCheck,
      color: 'text-emerald-400',
    },
    {
      label: 'Yield Target',
      value: `${stats.yield_target}%`,
      change: `Target Gap: ${Math.max(
        0,
        (stats.yield_target - stats.pass_rate).toFixed(1)
      )}%`,
      icon: BadgePercent,
      color: 'text-cyan-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const BASE_API_URL =
    api.defaults.baseURL || 'http://localhost:8000';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Production Quality Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Real-time statistics and yield analytics overview
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="rounded-xl border border-white/5 bg-[#131A26]/40 p-6 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">
                  {card.label}
                </span>

                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>

              <p className="mt-2 text-3xl font-semibold text-white">
                {card.value}
              </p>

              <span className="mt-2 block text-xs text-slate-500">
                {card.change}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/5 bg-[#131A26]/40 p-6 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white mb-1">
          Recent Quality Inspections
        </h3>

        <p className="text-xs text-slate-400 mb-6">
          Latest product images analyzed by the system
        </p>

        {recentInspections.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-white/5 bg-slate-950/10 text-slate-500 text-sm">
            No recent inspections recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/20 text-slate-400">
                  <th className="p-4">Image</th>
                  <th className="p-4">Filename</th>
                  <th className="p-4">Prediction</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {recentInspections.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div className="h-12 w-16 overflow-hidden rounded border border-white/5">
                        <img
                          src={`${BASE_API_URL}${item.filepath}`}
                          alt={item.filename}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='40'><rect width='60' height='40' fill='%23131A26'/><text x='50%' y='50%' fill='white' font-size='8' dominant-baseline='middle' text-anchor='middle'>NO IMAGE</text></svg>";
                          }}
                        />
                      </div>
                    </td>

                    <td className="p-4">{item.filename}</td>

                    <td className="p-4">{item.prediction}</td>

                    <td className="p-4">{item.confidence}</td>

                    <td className="p-4">{item.severity}</td>

                    <td className="p-4">{item.status}</td>

                    <td className="p-4">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
