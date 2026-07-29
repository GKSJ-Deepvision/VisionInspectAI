import { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = "http://127.0.0.1:8000";

export default function FactoryTelemetryCharts() {
  const [liveMetrics, setLiveMetrics] = useState({ 
    total_inspections: 0, 
    defects_detected: 0, 
    pass_rate: 100.0, 
    system_status: "CONNECTING..." 
  });

  const [trendData, setTrendData] = useState([
    { time: '08:00', passed: 142, failed: 3 }, { time: '09:00', passed: 185, failed: 5 }, { time: '10:00', passed: 210, failed: 2 },
    { time: '11:00', passed: 195, failed: 8 }, { time: '12:00', passed: 160, failed: 4 }, { time: '13:00', passed: 220, failed: 6 },
    { time: '14:00', passed: 190, failed: 3 }
  ]);

  const [defectBreakdown, setDefectBreakdown] = useState([
    { name: 'Surface Crack', count: 14 }, { name: 'Scratch', count: 22 }, { name: 'Misalignment', count: 8 }, { name: 'Debris', count: 11 }
  ]);
  
  useEffect(() => {
    const fetchLiveTelemetry = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/analytics`);
        setLiveMetrics(res.data);
        
        if (res.data.defect_breakdown) {
          setDefectBreakdown(res.data.defect_breakdown);
        }
        
        setTrendData(prev => {
          const updated = [...prev];
          const latest = updated.length - 1;
          const fails = res.data.failed_inspections ?? res.data.defects_detected ?? 0;
          const total = res.data.total_inspections ?? 0;
          if (total > 0) {
            updated[latest] = { 
              ...updated[latest], 
              passed: updated[latest].passed + (total - fails), 
              failed: updated[latest].failed + fails 
            };
          }
          return updated;
        });
      } catch (err) {
        console.error("Telemetry fetch error:", err);
      }
    };

    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 4000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-xl text-xs font-mono border-slate-700 shadow-2xl">
          <p className="text-slate-300 font-bold mb-2 pb-1 border-b border-slate-700">Time: {label}</p>
          <p className="text-emerald-400 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>Passed: {payload[0]?.value}</p>
          <p className="text-rose-400 flex items-center mt-1"><span className="w-2 h-2 rounded-full bg-rose-400 mr-2"></span>Failed: {payload[1]?.value}</p>
        </div>
      );
    }
    return null;
  };

  // Safe formatting for pass rate to avoid duplicate '%' symbol
  const rawPassRate = liveMetrics?.pass_rate ?? liveMetrics?.automated_pass_rate_percent ?? 0;
  const passRateDisplay = typeof rawPassRate === 'number' ? `${rawPassRate}%` : (String(rawPassRate).endsWith('%') ? rawPassRate : `${rawPassRate}%`);
  
  const rejectionsValue = liveMetrics?.failed_inspections ?? liveMetrics?.defects_detected ?? 0;
  const latencyValue = liveMetrics?.avg_latency_ms ? `${Math.round(liveMetrics.avg_latency_ms)}ms` : '138ms';

  const kpis = [
    { title: 'Shift Throughput', val: liveMetrics.total_inspections ?? 0, icon: Activity, color: 'sky', subtitle: 'Active ingestion' },
    { title: 'Pass Rate', val: passRateDisplay, icon: CheckCircle2, color: 'emerald', subtitle: 'Target: >98.5%' },
    { title: 'Rejection Rate', val: rejectionsValue, icon: AlertTriangle, color: 'rose', subtitle: 'Flagged for QA' },
    { title: 'Avg Latency', val: latencyValue, icon: Clock, color: 'amber', subtitle: 'WideResNet-50' }
  ];

  return (
    <div className="space-y-6 text-slate-100 font-sans max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i*0.1 }} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-16 h-16 bg-${k.color}-500/10 rounded-full blur-xl group-hover:bg-${k.color}-500/20 transition-colors`}></div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest">{k.title}</span>
              <k.icon className={`h-4 w-4 text-${k.color}-400 ${i===0?'animate-pulse':''}`} />
            </div>
            <div className={`text-4xl font-black font-mono text-${k.color}-400`}>{k.val}</div>
            <div className="text-[10px] text-slate-500 mt-2 font-mono">{k.subtitle}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-8 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold flex items-center text-white"><TrendingUp className="h-5 w-5 mr-2 text-sky-400" />Real-Time Trend</h3>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-full">
               <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
               <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">LIVE POLLING</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="passed" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorPassed)" animationDuration={1000} />
                <Area type="monotone" dataKey="failed" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorFailed)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center text-white mb-6"><BarChart3 className="h-5 w-5 mr-2 text-amber-400" />Defect Types</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defectBreakdown} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#cbd5e1', fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff', backdropFilter: 'blur(8px)' }} itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={16} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="border-t border-slate-800/80 pt-4 mt-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-500">
            <span>Primary Anomaly:</span><span className="text-rose-400 font-bold bg-rose-950/30 px-2 py-1 rounded">Scratch (40%)</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}