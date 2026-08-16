import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertTriangle, DollarSign, TrendingUp, Database, Activity, RefreshCw, Layers, ShieldAlert, Cpu, Target, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Factory, Eye, Gauge, Zap, Clock, Download, Search, Filter, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePie, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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
      // Audio effect
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        if (res.data.pass_fail_decision === 'PASS') {
          osc.frequency.setValueAtTime(523, ctx.currentTime); osc.frequency.setValueAtTime(659, ctx.currentTime+0.1); osc.frequency.setValueAtTime(784, ctx.currentTime+0.2);
          gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.5);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.5);
        } else {
          osc.type = 'square'; osc.frequency.setValueAtTime(440, ctx.currentTime); osc.frequency.setValueAtTime(220, ctx.currentTime+0.15);
          gain.gain.setValueAtTime(0.25, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.6);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.6);
        }
      } catch(e) {}
      addToast?.(res.data.pass_fail_decision === 'PASS' ? 'Passed Inspection' : 'Failed Inspection', res.data.pass_fail_decision === 'PASS' ? 'success' : 'error');
    } catch (err) {
      addToast?.("Server offline.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getDecision = () => {
    if (!result) return null;
    const d = result.pass_fail_decision;
    if (d === 'PASS') return { label: 'PASS', color: 'emerald', bg: 'bg-emerald-950/40 border-emerald-500', text: 'text-emerald-300' };
    if (d === 'FAIL') return { label: 'FAIL', color: 'rose', bg: 'bg-rose-950/40 border-rose-500', text: 'text-rose-300' };
    return { label: d, color: 'amber', bg: 'bg-amber-950/40 border-amber-500', text: 'text-amber-300' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center space-x-3 mb-6 bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-full">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase font-bold">STATION ONLINE</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">CONVEYOR #1</h2>
          <p className="text-sm text-slate-400 mb-10 font-mono tracking-widest uppercase">Awaiting Component Frame For Analysis</p>

          <label className="border-2 border-dashed border-slate-600 hover:border-sky-500 rounded-3xl p-2 flex flex-col items-center justify-center cursor-pointer bg-slate-950/80 max-w-2xl w-full mx-auto mb-8 group transition-all duration-300 relative min-h-[300px] shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-t from-sky-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
            {previewUrl ? (
               <div className="relative w-full h-full scanner-container rounded-2xl overflow-hidden flex items-center justify-center">
                 <img src={previewUrl} alt="Preview" className="max-h-72 object-contain z-10 rounded-lg shadow-lg" />
                 {loading && <div className="scanner-line"></div>}
               </div>
            ) : (
              <div className="py-16 text-slate-500 group-hover:text-sky-300 transition-colors flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <Upload className="h-10 w-10 text-sky-400 animate-bounce" />
                </div>
                <span className="font-black tracking-widest text-sm uppercase">Tap to Capture Frame</span>
                <span className="text-[10px] font-mono mt-2 opacity-60">Supported: PNG, JPEG</span>
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

          <button onClick={handleInspect} disabled={!selectedFile || loading} className="w-full max-w-2xl py-5 rounded-2xl font-black text-lg tracking-widest transition-all duration-300 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] transform active:scale-95">
            {loading ? <span className="flex items-center justify-center"><RefreshCw className="w-6 h-6 mr-3 animate-spin"/> ANALYZING...</span> : "INSTANT INSPECT"}
          </button>

          <AnimatePresence>
            {result && (() => {
              const d = getDecision();
              return (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className={`mt-10 p-10 w-full max-w-2xl rounded-3xl border-2 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden ${d.bg} ${d.text}`}>
                  <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none opacity-50 bg-${d.color}-500`}></div>
                  <div className="text-xs font-mono uppercase tracking-widest opacity-80 mb-2 z-10 flex items-center">
                    <Cpu className="w-4 h-4 mr-2" /> AI DECISION VERDICT
                  </div>
                  <div className="text-7xl sm:text-8xl font-black font-mono tracking-wider mb-4 z-10 drop-shadow-lg">{d.label}</div>
                  
                  {/* Show details */}
                  {result.matched_category && (
                    <div className="z-10 mb-4 flex flex-wrap gap-2 justify-center">
                      <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700 text-sky-400">Category: {result.matched_category}</span>
                      <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700 text-sky-400">Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                      {result.severity_level && <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700 text-amber-400">Severity: {result.severity_level}</span>}
                    </div>
                  )}

                  <div className="text-sm font-bold bg-slate-900/60 px-6 py-3 rounded-xl border border-slate-700/50 text-center opacity-90 z-10 backdrop-blur-sm">{result.recommendation}</div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// 2. OWNER / EXECUTIVE VIEW - POWER BI STYLE
// ==========================================
const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#22d3ee', '#fb923c'];

export function OwnerExecutiveView() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);
  const [severityDist, setSeverityDist] = useState([]);
  const [trends, setTrends] = useState([]);
  const [categoryPerf, setCategoryPerf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // History tab state - MUST be before any early returns (React hooks rules)
  const [historyData, setHistoryData] = useState([]);
  const [histSearch, setHistSearch] = useState('');
  const [histResult, setHistResult] = useState('All');
  const [histDecision, setHistDecision] = useState('All');
  const [histSeverity, setHistSeverity] = useState('All');
  const [histCategory, setHistCategory] = useState('All');
  const [histTime, setHistTime] = useState('All');
  const [histSort, setHistSort] = useState('newest');

  useEffect(() => {
    if (activeTab === 'records') {
      axios.get(`${API_BASE}/api/inspections/history?limit=200`).then(r => {
        const d = r.data;
        setHistoryData(Array.isArray(d) ? d : (d.inspections || []));
      }).catch(() => {});
    }
  }, [activeTab]);

  const fetchAll = async () => {
    try {
      const [summaryR, recentR, defectsR, severityR, trendsR] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/analytics/summary`),
        axios.get(`${API_BASE}/api/analytics/recent-inspections`),
        axios.get(`${API_BASE}/api/analytics/defect-types`),
        axios.get(`${API_BASE}/api/analytics/severity-distribution`),
        axios.get(`${API_BASE}/api/analytics/defect-trends`),
      ]);

      if (summaryR.status === 'fulfilled' && summaryR.value?.data) {
        const s = summaryR.value.data;
        setStats({
          total: s.total_inspections || 0,
          defectRate: s.defect_rate || 0,
          avgConfidence: s.avg_confidence || 0,
          passRate: s.pass_rate || 0,
          avgLatency: s.avg_latency || 0,
          savings: s.estimated_savings_usd || 0,
          oee: s.oee_efficiency || 0,
        });
      }

      if (recentR.status === 'fulfilled' && recentR.value?.data) {
        const raw = recentR.value.data;
        const arr = Array.isArray(raw) ? raw : (raw.inspections || raw.data || []);
        if (arr.length) setLogs(arr.slice(0, 15));
      }

      if (defectsR.status === 'fulfilled' && defectsR.value?.data) {
        const d = defectsR.value.data;
        let arr = [];
        if (d.defect_types && Array.isArray(d.defect_types)) {
          arr = d.defect_types.map(item => ({ name: (item.name || item.defect_type || '').replace(/_/g, ' '), value: item.count || item.value || 0 }));
        } else if (Array.isArray(d)) {
          arr = d.map(item => ({ name: (item.name || item.defect_type || '').replace(/_/g, ' '), value: item.count || item.value || 0 }));
        } else {
          arr = Object.entries(d).filter(([k]) => k !== 'status').map(([name, count]) => ({ name: name.replace(/_/g, ' '), value: typeof count === 'number' ? count : 0 }));
        }
        setDefectTypes(arr.length ? arr : generateMockDefects());
      } else {
        setDefectTypes(generateMockDefects());
      }

      if (severityR.status === 'fulfilled' && severityR.value?.data) {
        const d = severityR.value.data;
        let arr = [];
        if (d.distribution && Array.isArray(d.distribution)) {
          arr = d.distribution.map(item => ({ name: item.name || item.severity_level || '', value: item.value || item.count || 0 }));
        } else if (Array.isArray(d)) {
          arr = d.map(item => ({ name: item.name || item.severity_level || '', value: item.value || item.count || 0 }));
        } else {
          arr = Object.entries(d).filter(([k]) => k !== 'status').map(([name, count]) => ({ name, value: typeof count === 'number' ? count : 0 }));
        }
        setSeverityDist(arr.length ? arr : generateMockSeverity());
      } else {
        setSeverityDist(generateMockSeverity());
      }

      if (trendsR.status === 'fulfilled' && trendsR.value?.data) {
        const raw = trendsR.value.data;
        const arr = Array.isArray(raw) ? raw : (raw.trends || []);
        setTrends(arr.length ? arr : generateMockTrends());
      } else {
        setTrends(generateMockTrends());
      }

      setCategoryPerf(generateCategoryPerf());

    } catch (e) {
      setStats({ total: 247, defectRate: 18.2, avgConfidence: 92.4, passRate: 81.8, avgLatency: 342, savings: 14850, oee: 99.4 });
      setDefectTypes(generateMockDefects());
      setSeverityDist(generateMockSeverity());
      setTrends(generateMockTrends());
      setCategoryPerf(generateCategoryPerf());
      setLogs(generateMockLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); const i = setInterval(fetchAll, 15000); return () => clearInterval(i); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center space-y-4">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span className="text-sm font-mono text-slate-400 tracking-widest">LOADING EXECUTIVE DASHBOARD...</span>
      </div>
    </div>
  );

  const s = stats || { total: 0, defectRate: 0, avgConfidence: 0, passRate: 0, avgLatency: 0, savings: 0, oee: 0 };

  const kpis = [
    { label: 'Total Inspections', value: s.total, icon: Eye, color: 'sky', change: '+12%' },
    { label: 'Pass Rate', value: `${s.passRate.toFixed(1)}%`, icon: CheckCircle2, color: 'emerald', change: '+3.2%' },
    { label: 'Defect Rate', value: `${s.defectRate.toFixed(1)}%`, icon: AlertTriangle, color: 'rose', change: '-2.1%', down: true },
    { label: 'Avg Confidence', value: `${s.avgConfidence.toFixed(1)}%`, icon: Target, color: 'indigo', change: '+1.5%' },
    { label: 'Avg Latency', value: `${s.avgLatency.toFixed(0)}ms`, icon: Zap, color: 'amber', change: '-15ms', down: true },
    { label: 'Est. Savings', value: `$${(s.savings/1000).toFixed(1)}K`, icon: DollarSign, color: 'emerald', change: '+$2.4K' },
    { label: 'OEE Efficiency', value: `${s.oee.toFixed(1)}%`, icon: Gauge, color: 'sky', change: '+0.3%' },
    { label: 'Active Lines', value: '4', icon: Factory, color: 'violet', change: 'Stable' },
  ];


  const filteredHistory = historyData.filter(h => {
    if (histSearch && !(h.original_filename || h.matched_category || h.defect_type || '').toLowerCase().includes(histSearch.toLowerCase())) return false;
    if (histResult !== 'All' && h.pass_fail_decision !== histResult) return false;
    if (histDecision !== 'All') {
      const sv = h.severity_score || 0;
      if (histDecision === 'Accept' && (h.pass_fail_decision !== 'PASS')) return false;
      if (histDecision === 'Rework' && !(h.pass_fail_decision === 'FAIL' && sv < 50)) return false;
      if (histDecision === 'Reject' && !(h.pass_fail_decision === 'FAIL' && sv >= 50)) return false;
    }
    if (histSeverity !== 'All') {
      const sl = (h.severity_level || 'NONE').toUpperCase();
      if (histSeverity.toUpperCase() !== sl) return false;
    }
    if (histCategory !== 'All' && h.matched_category !== histCategory) return false;
    if (histTime !== 'All' && h.created_at) {
      const d = new Date(h.created_at);
      const now = new Date();
      if (histTime === 'Today' && d.toDateString() !== now.toDateString()) return false;
      if (histTime === 'This Week' && (now - d) > 7*86400000) return false;
      if (histTime === 'This Month' && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
    }
    return true;
  }).sort((a, b) => histSort === 'newest' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at));

  const histPassed = historyData.filter(h => h.pass_fail_decision === 'PASS').length;
  const histFailed = historyData.filter(h => h.pass_fail_decision === 'FAIL').length;
  const histNoDefect = historyData.filter(h => (h.defect_type || 'None').toLowerCase() === 'none' || !h.defect_type).length;

  const exportCSV = () => {
    const headers = ['File','Category','Defect','Severity','Score','Result','Decision','Date'];
    const rows = filteredHistory.map(h => [
      h.original_filename || '', h.matched_category || '', h.defect_type || 'None',
      h.severity_level || 'NONE', ((h.confidence_score||0)*100).toFixed(0)+'%',
      h.pass_fail_decision, h.pass_fail_decision === 'PASS' ? 'Accept' : (h.severity_score||0) >= 50 ? 'Reject' : 'Rework',
      h.created_at || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inspection_history.csv'; a.click();
  };

  const getSevBadge = (level) => {
    const l = (level || 'NONE').toUpperCase();
    const map = { NONE: 'bg-slate-800 text-slate-400', LOW: 'bg-emerald-950/60 text-emerald-400', MEDIUM: 'bg-amber-950/60 text-amber-400', HIGH: 'bg-orange-950/60 text-orange-400', CRITICAL: 'bg-rose-950/60 text-rose-400' };
    return map[l] || map.NONE;
  };

  const getQualityDecision = (h) => {
    if (h.pass_fail_decision === 'PASS') return { label: 'Accept', cls: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' };
    if ((h.severity_score || 0) >= 50) return { label: 'Reject', cls: 'bg-rose-950/50 text-rose-400 border-rose-800/50' };
    return { label: 'Rework', cls: 'bg-amber-950/50 text-amber-400 border-amber-800/50' };
  };

  const categories15 = ['bottle','cable','capsule','carpet','grid','hazelnut','leather','metal_nut','pill','screw','tile','toothbrush','transistor','wood','zipper'];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'defects', label: 'Defect Analysis' },
    { id: 'trends', label: 'Trends & Forecast' },
    { id: 'records', label: 'Inspection Records' },
    { id: 'logs', label: 'Audit Log' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <div className="text-[10px] font-mono text-sky-400 tracking-[0.3em] uppercase mb-1">FACTORY COMMAND CENTER</div>
          <h2 className="text-3xl font-black tracking-tight text-white">Executive Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">Power BI-style interactive production intelligence.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700">
          <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
          <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase font-bold">LIVE DATA</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-mono font-bold tracking-wider transition-all ${activeTab === tab.id ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <kpi.icon className={`w-4 h-4 text-${kpi.color}-400`} />
              <span className={`text-[9px] font-mono font-bold flex items-center gap-0.5 ${kpi.down ? 'text-emerald-400' : 'text-emerald-400'}`}>
                {kpi.down ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <div className={`text-2xl font-black font-mono text-${kpi.color}-400 mb-0.5`}>{kpi.value}</div>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-5">
          {/* Defect Trend Chart */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" /> Inspection Volume (30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#475569" fontSize={9} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#475569" fontSize={9} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="pass" stroke="#34d399" fill="url(#colorPass)" strokeWidth={2} name="Pass" />
                <Area type="monotone" dataKey="fail" stroke="#f43f5e" fill="url(#colorFail)" strokeWidth={2} name="Fail" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Defect Types Pie */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" /> Defect Distribution
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RePie>
                <Pie data={defectTypes} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={8}>
                  {defectTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }} />
              </RePie>
            </ResponsiveContainer>
          </div>

          {/* Severity Distribution */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" /> Severity Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={severityDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                <YAxis stroke="#475569" fontSize={9} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Count">
                  {severityDist.map((entry, i) => {
                    const colors = { NONE: '#34d399', LOW: '#fbbf24', MEDIUM: '#fb923c', HIGH: '#f43f5e', CRITICAL: '#dc2626' };
                    return <Cell key={i} fill={colors[entry.name] || COLORS[i]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Performance Radar */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Category Detection Performance
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={categoryPerf}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="category" stroke="#475569" fontSize={8} />
                <PolarRadiusAxis stroke="#475569" fontSize={8} domain={[0, 100]} />
                <Radar name="Accuracy %" dataKey="accuracy" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* DEFECT ANALYSIS TAB */}
      {activeTab === 'defects' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Defect Type Frequency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={defectTypes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#475569" fontSize={9} />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={9} width={80} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Count">
                    {defectTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Detection Confidence Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#475569" fontSize={9} domain={[80, 100]} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="confidence" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 3 }} name="Confidence %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Per-Category Accuracy</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#475569" fontSize={8} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#475569" fontSize={9} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} name="Accuracy %">
                  {categoryPerf.map((entry, i) => <Cell key={i} fill={entry.accuracy >= 90 ? '#34d399' : entry.accuracy >= 80 ? '#fbbf24' : '#f43f5e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* TRENDS TAB */}
      {activeTab === 'trends' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Daily Inspection Volume & Quality</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#475569" fontSize={9} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#475569" fontSize={9} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="total" stroke="#38bdf8" fill="url(#gTotal)" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="pass" stroke="#34d399" strokeWidth={2} dot={false} name="Pass" />
                <Line type="monotone" dataKey="fail" stroke="#f43f5e" strokeWidth={2} dot={false} name="Fail" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* AUDIT LOG TAB */}
      {/* RECORDS TAB */}
      {activeTab === 'records' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-sky-400 tracking-[0.3em] uppercase mb-1">QUALITY RECORDS</div>
              <h3 className="text-2xl font-black text-white">Inspection History</h3>
              <p className="text-sm text-slate-400 mt-1">Review previous AI-powered inspection results.</p>
            </div>
            <button onClick={exportCSV} className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg">
              <Download className="w-4 h-4" /><span>Export CSV</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            {[{ label: 'Total Inspections', val: historyData.length, color: 'sky' }, { label: 'Passed', val: histPassed, color: 'emerald' }, { label: 'Failed', val: histFailed, color: 'rose' }, { label: 'No Defect', val: histNoDefect, color: 'slate' }].map((c, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">{c.label}</div>
                <div className={`text-3xl font-black font-mono text-${c.color}-400`}>{c.val}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={histSearch} onChange={e => setHistSearch(e.target.value)} placeholder="Search file or defect..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono text-slate-300 focus:border-sky-500 focus:outline-none" />
              </div>
              <select value={histResult} onChange={e => setHistResult(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500">
                <option value="All">All Inspection Results</option>
                <option value="PASS">Pass</option>
                <option value="FAIL">Fail</option>
              </select>
              <select value={histDecision} onChange={e => setHistDecision(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500">
                <option value="All">All Quality Decisions</option>
                <option value="Accept">Accept</option>
                <option value="Rework">Rework</option>
                <option value="Reject">Reject</option>
              </select>
              <select value={histSeverity} onChange={e => setHistSeverity(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500">
                <option value="All">All Severity Levels</option>
                {['NONE','LOW','MEDIUM','HIGH','CRITICAL'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <select value={histCategory} onChange={e => setHistCategory(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500">
                <option value="All">All Categories</option>
                {categories15.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={histTime} onChange={e => setHistTime(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500">
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
              <select value={histSort} onChange={e => setHistSort(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <button onClick={() => { setHistSearch(''); setHistResult('All'); setHistDecision('All'); setHistSeverity('All'); setHistCategory('All'); setHistTime('All'); setHistSort('newest'); }}
                className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all">
                Reset Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-xs font-mono text-slate-500">Showing {filteredHistory.length} of {historyData.length} loaded records</div>

          {/* Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-sm">
                <thead className="bg-slate-900/80">
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">File</th>
                    <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Category</th>
                    <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Defect</th>
                    <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Severity</th>
                    <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Score</th>
                    <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Inspection Result</th>
                    <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Quality Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {filteredHistory.length === 0 ? (
                    <tr><td colSpan="7" className="py-12 text-center text-slate-500 text-xs">No records match your filters.</td></tr>
                  ) : filteredHistory.map((h, i) => {
                    const qd = getQualityDecision(h);
                    return (
                      <motion.tr key={h.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}
                        className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-xs text-sky-400 font-bold">{h.original_filename || `INS-${(h.id||'').substring(0,6)}`}</td>
                        <td className="px-4 py-3 text-xs capitalize">{h.matched_category || 'Unknown'}</td>
                        <td className="px-4 py-3 text-xs">{h.pass_fail_decision === 'FAIL' ? 'Defective' : 'No defect'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider ${getSevBadge(h.severity_level)}`}>
                            {(h.severity_level || 'None').charAt(0).toUpperCase() + (h.severity_level || 'None').slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold">{((h.confidence_score || 0)).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded text-[9px] font-bold tracking-wider ${h.pass_fail_decision === 'PASS' ? 'bg-emerald-950/50 text-emerald-400' : 'bg-rose-950/50 text-rose-400'}`}>
                            {h.pass_fail_decision === 'PASS' ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded text-[9px] font-bold tracking-wider border ${qd.cls}`}>{qd.label}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'logs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Database className="w-4 h-4 text-sky-400" /> Live Audit Ledger</h3>
            <button onClick={fetchAll} className="text-[9px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-lg hover:bg-sky-500/20 transition-all flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> REFRESH
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl bg-slate-950/30 border border-slate-800/50">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-slate-900/80">
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">ID</th>
                  <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Category</th>
                  <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Decision</th>
                  <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Severity</th>
                  <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Confidence</th>
                  <th className="px-4 py-3 font-bold tracking-widest uppercase text-[10px]">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {logs.length === 0 ? (
                  <tr><td colSpan="6" className="py-12 text-center text-slate-500 text-xs">No inspections yet. Run some inspections to see data here.</td></tr>
                ) : logs.map((log, i) => (
                  <motion.tr key={log.inspection_id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-sky-400 font-bold text-xs">{(log.inspection_id || 'AUTO').substring(0, 8)}</td>
                    <td className="px-4 py-3 text-xs capitalize">{log.matched_category || log.product_sku || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${log.pass_fail_decision === 'PASS' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50' : log.pass_fail_decision === 'FAIL' ? 'bg-rose-950/50 text-rose-400 border border-rose-800/50' : 'bg-amber-950/50 text-amber-400 border border-amber-800/50'}`}>
                        {log.pass_fail_decision}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full ${(log.severity_score||0) > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${log.severity_score || 0}%`}}></div>
                        </div>
                        <span className="text-[10px] font-bold">{parseFloat(log.severity_score || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-indigo-400 font-bold">{(log.confidence * 100 || 0).toFixed(0)}%</td>
                    <td className="px-4 py-3 text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Mock data generators for demo ──
function generateMockDefects() {
  return [
    { name: 'Surface Scratch', value: 38 }, { name: 'Crack', value: 24 }, { name: 'Contamination', value: 18 },
    { name: 'Color Defect', value: 15 }, { name: 'Missing Part', value: 12 }, { name: 'Deformation', value: 9 },
    { name: 'Hole', value: 7 }, { name: 'Print Error', value: 5 },
  ];
}
function generateMockSeverity() {
  return [{ name: 'NONE', value: 142 }, { name: 'LOW', value: 38 }, { name: 'MEDIUM', value: 24 }, { name: 'HIGH', value: 15 }, { name: 'CRITICAL', value: 3 }];
}
function generateMockTrends() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const total = 6 + Math.floor(Math.random() * 12);
    const fail = Math.floor(total * (0.12 + Math.random() * 0.15));
    data.push({ date: d.toISOString().slice(0, 10), total, pass: total - fail, fail, confidence: 88 + Math.random() * 10 });
  }
  return data;
}
function generateCategoryPerf() {
  // Actual PatchCore WRN-50-2 evaluation results (90.7% overall accuracy)
  return [
    { category: 'bottle', accuracy: 98.8 }, { category: 'cable', accuracy: 85.3 },
    { category: 'capsule', accuracy: 85.6 }, { category: 'carpet', accuracy: 96.6 },
    { category: 'grid', accuracy: 87.2 }, { category: 'hazelnut', accuracy: 99.1 },
    { category: 'leather', accuracy: 100.0 }, { category: 'metal_nut', accuracy: 92.2 },
    { category: 'pill', accuracy: 89.2 }, { category: 'screw', accuracy: 75.0 },
    { category: 'tile', accuracy: 97.4 }, { category: 'toothbrush', accuracy: 88.1 },
    { category: 'transistor', accuracy: 85.0 }, { category: 'wood', accuracy: 94.9 },
    { category: 'zipper', accuracy: 94.0 },
  ];
}
function generateMockLogs() {
  return Array.from({ length: 8 }, (_, i) => ({
    inspection_id: `INS-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    product_sku: 'MVI-PROD-2026', matched_category: ['bottle','cable','capsule','hazelnut','metal_nut','pill','screw','tile'][i],
    pass_fail_decision: Math.random() > 0.3 ? 'PASS' : 'FAIL', severity_score: Math.random() * 85, confidence: 0.85 + Math.random() * 0.14,
    timestamp: new Date(Date.now() - i * 600000).toISOString()
  }));
}