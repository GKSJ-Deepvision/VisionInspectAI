import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, BarChart3, Clock, Zap, Database, PieChart as PieChartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://127.0.0.1:8000";
const COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#a78bfa'];

export default function FactoryTelemetryCharts() {
  const [activeChart, setActiveChart] = useState('line');
  const [trendData, setTrendData] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [defectTypeData, setDefectTypeData] = useState([]);
  const [qualityData, setQualityData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback data
  const fallbackTrends = [
    { time: '08:00', passed: 142, failed: 3 }, { time: '09:00', passed: 185, failed: 5 }, { time: '10:00', passed: 210, failed: 2 },
    { time: '11:00', passed: 195, failed: 8 }, { time: '12:00', passed: 160, failed: 4 }, { time: '13:00', passed: 220, failed: 6 },
    { time: '14:00', passed: 190, failed: 3 }
  ];
  const fallbackSeverity = [
    { name: 'Low', value: 45 }, { name: 'Medium', value: 35 }, { name: 'High', value: 15 }, { name: 'Critical', value: 5 }
  ];
  const fallbackDefects = [
    { name: 'Surface Crack', count: 14 }, { name: 'Scratch', count: 22 }, { name: 'Misalignment', count: 8 }, { name: 'Debris', count: 11 }
  ];
  const fallbackQuality = [
    { time: '08:00', gradeA: 120, gradeB: 20, gradeC: 5 },
    { time: '09:00', gradeA: 150, gradeB: 30, gradeC: 10 },
    { time: '10:00', gradeA: 180, gradeB: 25, gradeC: 7 }
  ];

  const fetchData = async () => {
    try {
      const [trends, severity, defects, quality] = await Promise.all([
        axios.get(`${API_BASE}/api/analytics/defect-trends`).catch(() => null),
        axios.get(`${API_BASE}/api/analytics/severity-distribution`).catch(() => null),
        axios.get(`${API_BASE}/api/analytics/defect-types`).catch(() => null),
        axios.get(`${API_BASE}/api/analytics/production-quality`).catch(() => null)
      ]);
      // API returns wrapped objects like { status, trends: [...] } — extract the array
      const extractArray = (res, key, fallback) => {
        if (!res || !res.data) return fallback;
        const d = res.data;
        if (Array.isArray(d)) return d;
        if (d[key] && Array.isArray(d[key])) return d[key];
        // Try to find any array property
        for (const v of Object.values(d)) {
          if (Array.isArray(v)) return v;
        }
        return fallback;
      };
      setTrendData(extractArray(trends, 'trends', fallbackTrends).map(d => ({
        time: d.time || d.date || '', passed: d.passed ?? 0, failed: d.failed ?? d.defects ?? 0
      })));
      setSeverityData(extractArray(severity, 'distribution', fallbackSeverity).map(d => ({
        name: d.name || d.severity_level || '', value: d.value ?? d.count ?? 0
      })));
      setDefectTypeData(extractArray(defects, 'defect_types', fallbackDefects).map(d => ({
        name: d.name || d.defect_type || '', count: d.count ?? 0
      })));
      setQualityData(extractArray(quality, 'quality', fallbackQuality));
    } catch (err) {
      console.error("Telemetry fetch error", err);
      setTrendData(fallbackTrends);
      setSeverityData(fallbackSeverity);
      setDefectTypeData(fallbackDefects);
      setQualityData(fallbackQuality);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-xl text-xs font-mono border-slate-700 shadow-2xl z-50 relative">
          <p className="text-slate-300 font-bold mb-2 pb-1 border-b border-slate-700">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="flex items-center mt-1">
              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-white">Factory Telemetry</h2>
        <div className="flex space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {[
            { id: 'line', icon: TrendingUp, label: 'Trends' },
            { id: 'bar', icon: BarChart3, label: 'Types' },
            { id: 'area', icon: Activity, label: 'Quality' },
            { id: 'pie', icon: PieChartIcon, label: 'Severity' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveChart(btn.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                activeChart === btn.id ? 'bg-sky-500/20 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <btn.icon className="w-3.5 h-3.5" />
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px]">
        <motion.div 
          key={activeChart}
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, type: 'spring' }} 
          className="lg:col-span-8 glass-card p-6 rounded-2xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center text-white">
              {activeChart === 'line' && <><TrendingUp className="h-5 w-5 mr-2 text-sky-400" /> Defect Trends</>}
              {activeChart === 'bar' && <><BarChart3 className="h-5 w-5 mr-2 text-sky-400" /> Defect Types</>}
              {activeChart === 'area' && <><Activity className="h-5 w-5 mr-2 text-sky-400" /> Production Quality</>}
              {activeChart === 'pie' && <><PieChartIcon className="h-5 w-5 mr-2 text-sky-400" /> Severity Distribution</>}
            </h3>
            <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">LIVE POLLING</span>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 rounded-xl">
                <Activity className="w-8 h-8 text-sky-500 animate-spin" />
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'line' ? (
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="passed" stroke="#34d399" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#34d399', stroke: '#020617', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="failed" stroke="#fb7185" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#fb7185', stroke: '#020617', strokeWidth: 2 }} />
                </LineChart>
              ) : activeChart === 'area' ? (
                <AreaChart data={qualityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGradeA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorGradeB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="gradeA" stackId="1" stroke="#38bdf8" fill="url(#colorGradeA)" />
                  <Area type="monotone" dataKey="gradeB" stackId="1" stroke="#fbbf24" fill="url(#colorGradeB)" />
                  <Area type="monotone" dataKey="gradeC" stackId="1" stroke="#fb7185" fill="#fb7185" fillOpacity={0.4} />
                </AreaChart>
              ) : activeChart === 'bar' ? (
                <BarChart data={defectTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={30}>
                    {defectTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1' }} />
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center text-white mb-6"><BarChart3 className="h-5 w-5 mr-2 text-amber-400" />Quick Summary</h3>
            <div className="space-y-4">
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Most Common Defect</div>
                  <div className="text-sm font-bold text-white">Scratch</div>
                </div>
                <div className="text-rose-400 font-bold bg-rose-950/40 px-2 py-1 rounded text-xs">22 Incidents</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Highest Severity</div>
                  <div className="text-sm font-bold text-white">Surface Crack</div>
                </div>
                <div className="text-amber-400 font-bold bg-amber-950/40 px-2 py-1 rounded text-xs">14 Incidents</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Average Passing Rate</div>
                  <div className="text-sm font-bold text-white">Quality Score</div>
                </div>
                <div className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1 rounded text-xs">98.5%</div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800/80 pt-4 mt-6 flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">Neural Engine Status</span>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-sky-500 to-emerald-400" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}