import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, AlertTriangle, DollarSign, TrendingUp, Database, Activity, RefreshCw } from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000";

// ==========================================
// 1. CLIENT / OPERATOR VIEW
// ==========================================
export function ClientOperatorView({ addToast }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInspect = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("product_sku", "MVI-OPERATOR-LINE-01");

    try {
      const res = await axios.post(`${API_BASE}/api/inspect`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
      addToast?.(res.data.pass_fail_decision === 'PASS' ? 'Passed Inspection' : 'Failed Inspection', res.data.pass_fail_decision === 'PASS' ? 'success' : 'error');
    } catch (err) {
      addToast?.("Server offline.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[80px] rounded-full"></div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">CONVEYOR STATION #1</h2>
        <p className="text-sm text-slate-400 mb-8 font-mono">AWAITING COMPONENT FRAME FOR AUTOMATED DECISION</p>

        <label className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-2 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 max-w-xl mx-auto mb-8 group transition-colors relative min-h-[250px]">
          {previewUrl ? (
             <div className="relative w-full h-full scanner-container rounded-xl overflow-hidden flex items-center justify-center">
               <img src={previewUrl} alt="Preview" className="max-h-60 object-contain z-10" />
               {loading && <div className="scanner-line"></div>}
             </div>
          ) : (
            <div className="py-12 text-slate-400 group-hover:text-white transition-colors">
              <Upload className="h-14 w-14 mx-auto mb-4 text-sky-400 animate-bounce" />
              <span className="font-bold tracking-wider text-sm uppercase">Tap to Capture Frame</span>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
            if (e.target.files[0]) {
               setSelectedFile(e.target.files[0]);
               setPreviewUrl(URL.createObjectURL(e.target.files[0]));
               setResult(null);
            }
          }} />
        </label>

        <button onClick={handleInspect} disabled={!selectedFile || loading} className="w-full max-w-xl py-5 rounded-xl font-black text-lg tracking-widest transition-all bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white disabled:opacity-50 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]">
          {loading ? "ANALYZING..." : "INSTANT INSPECT"}
        </button>

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`mt-10 p-8 rounded-2xl border-2 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden ${result.pass_fail_decision === 'PASS' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-rose-950/40 border-rose-500 text-rose-300'}`}>
            <div className={`absolute inset-0 opacity-20 pointer-events-none ${result.pass_fail_decision !== 'PASS' ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZmYwMDAwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+")] animate-pulse' : ''}`}></div>
            <div className="text-xs font-mono uppercase tracking-widest opacity-80 mb-2 z-10">AI DECISION VERDICT</div>
            <div className="text-7xl font-black font-mono tracking-wider mb-4 z-10">{result.pass_fail_decision}</div>
            <div className="text-sm font-semibold max-w-md text-center opacity-90 z-10">{result.recommendation}</div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ==========================================
// 2. OWNER / EXECUTIVE VIEW
// ==========================================
export function OwnerExecutiveView() {
  const [stats, setStats] = useState({ revenueSaved: 14850, oee: 99.4, stations: 4, dbSize: 4.2 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/analytics/recent-inspections`);
        if(res.data && res.data.length > 0) {
          setLogs(res.data.slice(0, 10)); // Just show recent 10
        } else { throw new Error('no data'); }
      } catch (e) {
        // Fallback mock data
        setLogs([
          { inspection_id: 'INS-8F9A2B', product_sku: 'MVI-PROD-2026', pass_fail_decision: 'FAIL', severity_score: 78.4, timestamp: new Date().toISOString() },
          { inspection_id: 'INS-3A1C9D', product_sku: 'MVI-PROD-2026', pass_fail_decision: 'PASS', severity_score: 12.1, timestamp: new Date(Date.now()-300000).toISOString() },
          { inspection_id: 'INS-7E4B2A', product_sku: 'MVI-PROD-2026', pass_fail_decision: 'FAIL', severity_score: 88.9, timestamp: new Date(Date.now()-720000).toISOString() },
          { inspection_id: 'INS-9B8C7E', product_sku: 'MVI-PROD-2026', pass_fail_decision: 'PASS', severity_score: 5.4, timestamp: new Date(Date.now()-1080000).toISOString() },
        ]);
      } finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  const kpis = [
    { label: 'Est. Savings', value: `$${stats.revenueSaved}`, icon: DollarSign, color: 'emerald' },
    { label: 'OEE Efficiency', value: `${stats.oee}%`, icon: TrendingUp, color: 'sky' },
    { label: 'Active Stations', value: `${stats.stations}`, icon: Activity, color: 'indigo' },
    { label: 'DB Size', value: `${stats.dbSize} MB`, icon: Database, color: 'amber' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-500/10 blur-xl rounded-full -mr-10 -mt-10 group-hover:bg-${kpi.color}-500/20 transition-colors`}></div>
            <div className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 mb-3 flex justify-between">
              <span>{kpi.label}</span><kpi.icon className={`h-4 w-4 text-${kpi.color}-400`} />
            </div>
            <div className={`text-4xl font-black font-mono text-${kpi.color}-400`}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-sky-400" />
            <h3 className="font-bold text-lg text-white">Live SQLite Audit Ledger</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
            <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">SYNCING</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800/50">
                <th className="pb-3 font-medium tracking-widest uppercase">ID</th>
                <th className="pb-3 font-medium tracking-widest uppercase">SKU</th>
                <th className="pb-3 font-medium tracking-widest uppercase">Decision</th>
                <th className="pb-3 font-medium tracking-widest uppercase">Severity</th>
                <th className="pb-3 font-medium tracking-widest uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30 text-slate-300">
              {loading ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-500"><RefreshCw className="h-5 w-5 animate-spin mx-auto"/></td></tr>
              ) : (
                logs.map((log, i) => (
                  <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={log.inspection_id || i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 text-sky-400">{log.inspection_id?.substring(0,8) || "AUTO"}</td>
                    <td className="py-4">{log.product_sku}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${log.pass_fail_decision === 'PASS' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950/50 text-rose-400 border border-rose-800/50'}`}>
                        {log.pass_fail_decision}
                      </span>
                    </td>
                    <td className="py-4">
                       <div className="flex items-center space-x-2">
                         <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${log.severity_score > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${log.severity_score || 0}%`}}></div></div>
                         <span>{log.severity_score || 0}</span>
                       </div>
                    </td>
                    <td className="py-4 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}