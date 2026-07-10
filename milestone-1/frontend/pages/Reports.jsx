import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, AlertTriangle, Search, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/reports');
        setReports(response.data);
      } catch (err) {
        console.error(err);
        setError('Could not retrieve quality reports. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const handleDownload = (report) => {
    alert(`Downloading inspection summary PDF for record: ${report.id}\n(Placeholder PDF stub generated)`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Quality Inspection Reports</h1>
        <p className="text-sm text-slate-400">View and download completed line item inspection reports</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-[#131A26]/40 p-6 backdrop-blur-md">
        {/* Table Search bar */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
            placeholder="Search by Inspection ID or Image Name..."
          />
        </div>

        {/* Reports Table */}
        {reports.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-white/5 bg-slate-950/10 text-slate-500 text-sm">
            No inspection reports found in PostgreSQL database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/20 text-slate-400">
                  <th className="p-4 font-semibold">Inspection ID</th>
                  <th className="p-4 font-semibold">Timestamp</th>
                  <th className="p-4 font-semibold">Image File</th>
                  <th className="p-4 font-semibold">Prediction</th>
                  <th className="p-4 font-semibold">Confidence</th>
                  <th className="p-4 font-semibold">Severity</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports
                  .filter(report => 
                    report.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    report.item.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((report) => (
                    <tr key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="p-4 font-mono font-medium text-white">{report.id}</td>
                      <td className="p-4 text-slate-400">{new Date(report.created_at).toLocaleString()}</td>
                      <td className="p-4 text-slate-300">{report.item}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          report.prediction === 'Defective' 
                            ? 'bg-amber-500/10 text-amber-400' 
                            : report.prediction === 'Non-Defective'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {report.prediction === 'Defective' ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          {report.prediction}
                        </span>
                      </td>
                      <td className="p-4 text-white font-medium">{report.confidence}</td>
                      <td className="p-4 text-slate-400">{report.severity}</td>
                      <td className="p-4">
                        <span className="text-xs uppercase tracking-wide px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400">
                          {report.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </button>
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

export default Reports;
