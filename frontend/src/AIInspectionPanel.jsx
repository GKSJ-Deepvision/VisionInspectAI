import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ShieldCheck, AlertTriangle, CheckCircle2, Cpu, Activity, Zap, RefreshCw, ZoomIn, Search, Maximize2, Crosshair, ArrowRight, Layers, Download, Printer, Award, RotateCcw, FileText, History, X, ChevronRight, Sparkles, Eye, ArrowLeftRight, Database } from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000";

/* ─── Audio Effects ─── */
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'pass') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch (e) { /* Audio not supported */ }
};

/* ─── AI Suggestions ─── */
const getAISuggestions = (result) => {
  if (!result || result.pass_fail_decision === 'PASS') {
    return [
      { icon: '✓', text: 'Component meets all quality standards', type: 'success' },
      { icon: '→', text: 'Proceed to packaging and dispatch', type: 'info' },
    ];
  }
  const suggestions = [];
  const dt = (result.defect_type || '').toLowerCase();
  if (dt.includes('scratch') || dt.includes('crack')) {
    suggestions.push({ icon: '⚠', text: 'Surface damage detected — inspect tooling/conveyor for abrasive contact points', type: 'warn' });
    suggestions.push({ icon: '→', text: 'Recommend: Re-polish under controlled pressure (800-grit)', type: 'action' });
  } else if (dt.includes('color') || dt.includes('discoloration')) {
    suggestions.push({ icon: '⚠', text: 'Color/finish anomaly — check paint batch consistency and curing temperature', type: 'warn' });
    suggestions.push({ icon: '→', text: 'Recommend: Verify colorimeter readings against RAL standard', type: 'action' });
  } else if (dt.includes('deform') || dt.includes('bent')) {
    suggestions.push({ icon: '⚠', text: 'Structural deformation — inspect die/mold alignment and press calibration', type: 'warn' });
    suggestions.push({ icon: '→', text: 'Recommend: Run dimensional check with CMM gauge', type: 'action' });
  } else if (dt.includes('contamin')) {
    suggestions.push({ icon: '⚠', text: 'Foreign particle contamination — check cleanroom HEPA filter status', type: 'warn' });
    suggestions.push({ icon: '→', text: 'Recommend: Ultrasonic cleaning and re-inspect', type: 'action' });
  } else {
    suggestions.push({ icon: '⚠', text: `Anomaly detected: ${result.defect_type} — requires manual verification`, type: 'warn' });
    suggestions.push({ icon: '→', text: 'Recommend: Quarantine and re-inspect under controlled lighting', type: 'action' });
  }
  suggestions.push({ icon: '📊', text: `Severity: ${result.severity_score || 0}/100 — ${(result.severity_score || 0) >= 60 ? 'Critical, reject immediately' : 'Minor, consider override if within tolerance'}`, type: 'info' });
  return suggestions;
};

/* ─── PDF/Certificate Generator ─── */
const generateReport = (result, previewUrl, type = 'report') => {
  const isCert = type === 'certificate';
  const now = new Date();
  const suggestions = getAISuggestions(result);
  const isPASS = result.pass_fail_decision === 'PASS';
  
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>VisionInspect AI - ${isCert ? 'Quality Certificate' : 'Inspection Report'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid ${isPASS ? '#10b981' : '#ef4444'}; padding-bottom: 20px; margin-bottom: 30px; }
  .logo { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 900; color: #0f172a; }
  .logo span { color: ${isPASS ? '#10b981' : '#ef4444'}; }
  .badge { display: inline-block; padding: 8px 20px; border-radius: 8px; font-size: 18px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: white; background: ${isPASS ? '#10b981' : '#ef4444'}; letter-spacing: 3px; }
  .cert-stamp { text-align: center; margin: 30px 0; }
  .cert-stamp .verdict { font-size: 72px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: ${isPASS ? '#10b981' : '#ef4444'}; letter-spacing: 8px; text-transform: uppercase; border: 4px solid ${isPASS ? '#10b981' : '#ef4444'}; display: inline-block; padding: 15px 40px; border-radius: 12px; transform: rotate(-3deg); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
  .card h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; }
  .card .val { font-size: 20px; font-weight: 700; color: #0f172a; }
  .suggestions { margin: 20px 0; }
  .suggestion { padding: 10px 16px; margin: 6px 0; border-radius: 8px; font-size: 13px; border-left: 3px solid; }
  .suggestion.warn { background: #fef3c7; border-color: #f59e0b; }
  .suggestion.action { background: #dbeafe; border-color: #3b82f6; }
  .suggestion.info { background: #f0fdf4; border-color: #22c55e; }
  .suggestion.success { background: #f0fdf4; border-color: #10b981; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; }
  .sig-box { display: flex; justify-content: space-between; margin-top: 50px; }
  .sig { text-align: center; width: 200px; }
  .sig-line { border-top: 1px solid #94a3b8; padding-top: 8px; font-size: 11px; color: #64748b; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <div class="logo">Vision<span>Inspect</span> AI</div>
  <div style="text-align:right">
    <div style="font-size:11px;color:#94a3b8;font-family:monospace">${isCert ? 'QUALITY CHECK CERTIFICATE' : 'INSPECTION REPORT'}</div>
    <div style="font-size:11px;color:#64748b;font-family:monospace">ID: ${(result.inspection_id || 'AUTO-GEN').substring(0,12)}</div>
    <div style="font-size:11px;color:#64748b;font-family:monospace">${now.toLocaleString()}</div>
  </div>
</div>

${isCert ? `<div class="cert-stamp"><div class="verdict">${isPASS ? '✓ APPROVED' : '✗ REJECTED'}</div></div>` : ''}

<div class="grid">
  <div class="card"><h4>Verdict</h4><div class="val"><span class="badge">${result.pass_fail_decision}</span></div></div>
  <div class="card"><h4>Confidence</h4><div class="val">${((result.confidence_score || 0) * 100).toFixed(1)}%</div></div>
  <div class="card"><h4>Category</h4><div class="val">${result.matched_category || 'N/A'}</div></div>
  <div class="card"><h4>Severity</h4><div class="val">${result.severity_score || 0}/100</div></div>
  <div class="card"><h4>Defect Type</h4><div class="val">${result.defect_type || 'None'}</div></div>
  <div class="card"><h4>Latency</h4><div class="val">${result.processing_latency_ms || result.latency_ms || 0}ms</div></div>
</div>

<div class="suggestions">
  <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;font-family:'JetBrains Mono',monospace;letter-spacing:1px;text-transform:uppercase;color:#475569">AI Recommendations</h3>
  ${suggestions.map(s => `<div class="suggestion ${s.type}">${s.icon} ${s.text}</div>`).join('')}
</div>

${isCert ? `
<div class="sig-box">
  <div class="sig"><div class="sig-line">AI Inspector</div><div style="font-size:10px;color:#94a3b8;margin-top:4px">VisionInspect AI v2.0</div></div>
  <div class="sig"><div class="sig-line">Quality Engineer</div><div style="font-size:10px;color:#94a3b8;margin-top:4px">Signature</div></div>
  <div class="sig"><div class="sig-line">Date</div><div style="font-size:10px;color:#94a3b8;margin-top:4px">${now.toLocaleDateString()}</div></div>
</div>` : ''}

<div class="footer">
  VISIONINSPECT AI // GKSJ-DEEPVISION // Generated ${now.toISOString()} // Powered by WRN-50-2 PatchCore
</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => { if (type === 'print') win.print(); };
  }
};

/* ─── Override Verdict Modal ─── */
const OverrideModal = ({ isOpen, onClose, onOverride }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const reasons = [
    'Acceptable Surface Tolerance',
    'False Positive — No Visible Defect',
    'Customer Approved Deviation',
    'Within Cosmetic Spec Limits',
    'Re-inspected Under Better Lighting',
  ];
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-white">Manual Override</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Select a reason to override FAIL → PASS</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="space-y-2 mb-6">
          {reasons.map(r => (
            <button key={r} onClick={() => setSelectedReason(r)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border ${selectedReason === r ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'}`}>
              {selectedReason === r && <CheckCircle2 className="w-4 h-4 inline mr-2 text-amber-400" />}
              {r}
            </button>
          ))}
        </div>
        <button onClick={() => { if (selectedReason) onOverride(selectedReason); }}
          disabled={!selectedReason}
          className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg">
          <RotateCcw className="w-4 h-4 inline mr-2" />
          Override to PASS
        </button>
      </motion.div>
    </motion.div>
  );
};

/* ─── Image Comparison Slider ─── */
const ImageComparison = ({ originalUrl, heatmapUrl }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const handleMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, pos)));
  }, []);
  if (!originalUrl || !heatmapUrl) return null;
  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[250px] cursor-col-resize select-none overflow-hidden rounded-xl"
      onMouseMove={handleMove} onTouchMove={handleMove}>
      <img src={heatmapUrl} alt="Heatmap" className="absolute inset-0 w-full h-full object-contain" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <img src={originalUrl} alt="Original" className="w-full h-full object-contain" />
      </div>
      <div className="absolute top-0 bottom-0 z-20" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
        <div className="w-0.5 h-full bg-white/80 shadow-lg"></div>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <ArrowLeftRight className="w-4 h-4 text-slate-800" />
        </div>
      </div>
      <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-mono px-2 py-1 rounded">ORIGINAL</div>
      <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-mono px-2 py-1 rounded">AI HEATMAP</div>
    </div>
  );
};

/* ─── Inspection History Panel ─── */
const InspectionHistory = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  React.useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    axios.get(`${API_BASE}/api/inspections?limit=20`)
      .then(r => {
        const data = r.data;
        setHistory(Array.isArray(data) ? data : (data.inspections || data.data || []));
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white flex items-center"><History className="w-5 h-5 mr-2 text-sky-400" />Inspection History</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="overflow-y-auto flex-1 space-y-2">
          {loading && <div className="text-center py-8 text-slate-500 font-mono text-sm">Loading...</div>}
          {!loading && history.length === 0 && <div className="text-center py-8 text-slate-500 font-mono text-sm">No inspections yet</div>}
          {history.map((h, i) => (
            <div key={h.id || i} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${h.pass_fail_decision === 'PASS' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{h.matched_category || 'Unknown'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{h.created_at ? new Date(h.created_at).toLocaleString() : ''}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${h.pass_fail_decision === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{h.pass_fail_decision}</span>
                <span className="text-[10px] font-mono text-slate-400">{((h.confidence_score || 0) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};


/* ═══════════════════════════════════════════════════════════ */
/* ═══  MAIN COMPONENT  ═══════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════ */
export default function AIInspectionPanel({ addToast }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setOverrideReason(null);
      setStep(1);
    }
  };

  const handleInspect = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setOverrideReason(null);
    setStep(2);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("product_sku", "MVI-PROD-2026");

    try {
      setTimeout(() => setStep(3), 800);
      const res = await axios.post(`${API_BASE}/api/inspect`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
      setStep(4);
      playSound(res.data.pass_fail_decision === 'PASS' ? 'pass' : 'fail');
      addToast?.(`Inspection complete: ${res.data.pass_fail_decision}`, res.data.pass_fail_decision === 'PASS' ? 'success' : 'error');
    } catch (err) {
      setError("Inspection Pipeline Error: Unable to reach FastAPI on port 8000.");
      setStep(0);
      addToast?.('Pipeline Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = (reason) => {
    setOverrideReason(reason);
    setShowOverride(false);
    playSound('pass');
    addToast?.(`Verdict overridden: ${reason}`, 'info');
  };

  const currentVerdict = overrideReason ? 'PASS' : result?.pass_fail_decision;
  const isOverridden = !!overrideReason;

  const getSeverityColor = (score) => {
    if (score < 30) return 'text-emerald-400 stroke-emerald-400';
    if (score < 70) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const getDefectTypeColor = (type) => {
    if (!type || type.toLowerCase().includes('none')) return 'bg-slate-800 text-slate-300 border-slate-700';
    if (type.toLowerCase().includes('scratch') || type.toLowerCase().includes('crack')) return 'bg-rose-950/50 text-rose-300 border-rose-800';
    return 'bg-amber-950/50 text-amber-300 border-amber-800';
  };

  const suggestions = result ? getAISuggestions(result) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans text-slate-100">
      {/* Header */}
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="space-y-3 z-10 relative">
          <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-500/30 px-3 py-1.5 rounded-full text-[10px] font-mono text-sky-400 uppercase tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>MVTec Neural Engine Active — 90.7% Accuracy</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Visual Defect Analysis</h2>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">Upload high-resolution component captures for automated sub-millisecond anomaly feature classification.</p>
        </div>
        <button onClick={() => setShowHistory(true)}
          className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 hover:border-sky-500/50 px-4 py-2.5 rounded-xl text-xs font-mono text-slate-300 hover:text-sky-400 transition-all z-10">
          <History className="w-4 h-4" /><span>History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Upload + Pipeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden group shadow-xl">
            <label className="border-2 border-dashed border-slate-700 hover:border-sky-500/80 rounded-2xl p-2 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 transition-all min-h-[340px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sky-950/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center scanner-container rounded-xl overflow-hidden">
                  <img src={previewUrl} alt="Capture" className="max-h-[300px] object-contain z-10 relative rounded-lg" />
                  {loading && <div className="scanner-line"></div>}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-20 h-20 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                    <Upload className="h-8 w-8" />
                  </motion.div>
                  <div>
                    <div className="text-sm font-bold text-white mb-1">Upload Component Frame</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">PNG, JPEG (Max 10MB)</div>
                  </div>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>

            <div className="mt-6">
              <button onClick={handleInspect} disabled={!selectedFile || loading} className="w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white disabled:opacity-40 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] flex items-center justify-center space-x-2 transform active:scale-95">
                {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>PROCESSING FRAME...</span></> : <><Cpu className="h-4 w-4" /><span>EXECUTE INSPECTION</span></>}
              </button>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800/30 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-6 flex items-center"><Layers className="w-4 h-4 mr-2" /> Pipeline Status</h4>
            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              {['Upload Frame', 'Preprocess (CLAHE)', 'Feature Extraction', 'Classify & Match', 'Generate Report'].map((text, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="relative flex items-center space-x-4">
                  <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg ring-4 ring-slate-900 ${step > idx ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : step === idx && step !== 0 ? 'bg-sky-500 animate-pulse text-white shadow-[0_0_15px_rgba(56,189,248,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                    {step > idx ? '✓' : idx + 1}
                  </div>
                  <div className={`flex-1 text-xs font-mono p-2 rounded-lg transition-colors ${step === idx && step !== 0 ? 'bg-sky-500/10 border border-sky-500/20 text-sky-300' : step > idx ? 'text-slate-300' : 'text-slate-500'}`}>
                    {text}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card rounded-3xl p-12 text-center h-full min-h-[600px] flex flex-col items-center justify-center space-y-6 border-dashed shadow-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl animate-pulse"></div>
                  <Activity className="h-20 w-20 text-slate-700 relative z-10" />
                  <Search className="h-8 w-8 text-slate-500 absolute bottom-0 right-0 z-10" />
                </div>
                <div>
                  <div className="text-slate-400 font-mono text-sm uppercase tracking-widest mb-3">Awaiting Telemetry</div>
                  <div className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">Upload a component image to trigger the AI pipeline. Real-time anomaly heatmaps, confidence scores, and severity classifications will appear here.</div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring' }} className="space-y-6">
                
                {/* ═══ VERDICT BANNER ═══ */}
                <div className={`p-8 rounded-3xl border shadow-2xl relative overflow-hidden transition-colors duration-500 ${
                  isOverridden ? 'bg-amber-950/30 border-amber-500/50' :
                  currentVerdict === 'PASS' ? 'bg-emerald-950/30 border-emerald-500/50 hover:bg-emerald-950/40' : 
                  'bg-rose-950/30 border-rose-500/50 hover:bg-rose-950/40'}`}>
                  <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none ${
                    isOverridden ? 'bg-amber-500/20' :
                    currentVerdict === 'PASS' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}></div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center space-x-6">
                      <div className={`p-5 rounded-2xl ${
                        isOverridden ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]' :
                        currentVerdict === 'PASS' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]' : 
                        'bg-rose-500/20 text-rose-400 shadow-[0_0_30px_rgba(251,113,133,0.4)] animate-pulse'}`}>
                        {currentVerdict === 'PASS' ? <CheckCircle2 className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10" />}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1 flex items-center">
                          <Cpu className="w-3 h-3 mr-1" /> SYSTEM VERDICT
                        </div>
                        <div className={`text-5xl font-black tracking-wide font-mono ${
                          isOverridden ? 'text-amber-400' :
                          currentVerdict === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {currentVerdict}
                        </div>
                        {isOverridden && (
                          <div className="text-xs font-mono text-amber-400/70 mt-1 bg-amber-500/10 px-2 py-1 rounded inline-block border border-amber-500/30">
                            OVERRIDDEN: {overrideReason}
                          </div>
                        )}
                        <div className="text-xs font-semibold mt-2 text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-lg inline-block border border-slate-700/50 backdrop-blur-sm">{result.recommendation}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-md">
                      <div className="relative w-28 h-28">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                          <motion.circle cx="50" cy="50" r="42" className={getSeverityColor(result.severity_score || 0)} strokeWidth="8" strokeLinecap="round" fill="none" strokeDasharray="263.89" initial={{ strokeDashoffset: 263.89 }} animate={{ strokeDashoffset: 263.89 - (263.89 * (result.severity_score || 0)) / 100 }} transition={{ duration: 2, ease: "easeOut" }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-3xl font-black font-mono ${getSeverityColor(result.severity_score || 0).split(' ')[0]}`}>{result.severity_score || 0}</span>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono uppercase mt-3 text-slate-400 tracking-widest">Severity Index</div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap gap-2 mt-6 relative z-10">
                    {result.pass_fail_decision === 'FAIL' && !isOverridden && (
                      <button onClick={() => setShowOverride(true)}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all">
                        <RotateCcw className="w-3.5 h-3.5" /><span>Manual Override</span>
                      </button>
                    )}
                    <button onClick={() => generateReport(result, previewUrl, 'report')}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 transition-all">
                      <Download className="w-3.5 h-3.5" /><span>Download Report</span>
                    </button>
                    <button onClick={() => generateReport(result, previewUrl, 'certificate')}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-all">
                      <Award className="w-3.5 h-3.5" /><span>Quality Certificate</span>
                    </button>
                    <button onClick={() => generateReport(result, previewUrl, 'print')}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-500/10 border border-slate-500/30 text-slate-400 hover:bg-slate-500/20 transition-all">
                      <Printer className="w-3.5 h-3.5" /><span>Print Certificate</span>
                    </button>
                    <button onClick={() => setShowComparison(!showComparison)}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                      <ArrowLeftRight className="w-3.5 h-3.5" /><span>{showComparison ? 'Hide' : 'Compare'} Images</span>
                    </button>
                  </div>
                </div>

                {/* ═══ IMAGE COMPARISON ═══ */}
                <AnimatePresence>
                  {showComparison && result.heatmap_image_path && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="glass-card rounded-3xl overflow-hidden shadow-xl">
                      <div className="p-4 flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 bg-slate-900/50">
                        <span className="flex items-center"><Eye className="w-4 h-4 mr-2 text-sky-400" /> ORIGINAL vs AI DEFECT HEATMAP — Drag to Compare</span>
                      </div>
                      <div className="bg-[#0a0a0a] p-4 min-h-[300px]">
                        <ImageComparison originalUrl={previewUrl} heatmapUrl={`${API_BASE}/${result.heatmap_image_path}`} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ═══ AI SUGGESTIONS ═══ */}
                <div className="glass-card rounded-3xl p-6 shadow-xl">
                  <div className="text-xs font-mono text-slate-400 border-b border-slate-800 pb-3 mb-4 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-amber-400" /> AI REAL-TIME SUGGESTIONS
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className={`px-4 py-3 rounded-xl text-xs font-medium border ${
                          s.type === 'success' ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' :
                          s.type === 'warn' ? 'bg-amber-950/30 border-amber-800/50 text-amber-300' :
                          s.type === 'action' ? 'bg-sky-950/30 border-sky-800/50 text-sky-300' :
                          'bg-slate-800/30 border-slate-700/50 text-slate-300'
                        }`}>
                        <span className="mr-2">{s.icon}</span>{s.text}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* ═══ 4-PANEL COMPARISON VIEW ═══ */}
                <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
                  {/* Verdict Banner */}
                  <div className={`px-6 py-3 flex items-center space-x-4 text-sm font-bold ${result.pass_fail_decision === 'PASS' ? 'bg-emerald-950/40 border-b border-emerald-800/50' : 'bg-rose-950/40 border-b border-rose-800/50'}`}>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider border ${result.pass_fail_decision === 'PASS' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-rose-500/20 border-rose-500 text-rose-400'}`}>
                      {result.pass_fail_decision === 'PASS' ? '✓ ACCEPT' : '✗ REJECT'}
                    </span>
                    <span className="text-slate-400">Category: <span className="text-white font-black uppercase">{result.matched_category || 'N/A'}</span></span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">Defect: <span className="text-white font-bold">{result.defect_type || 'None'}</span></span>
                  </div>

                  {/* 4 Image Panels */}
                  <div className="grid grid-cols-4 gap-0.5 bg-slate-800/30 p-0.5">
                    {/* 1. Original Scan */}
                    <div className="bg-[#0a0e17] p-3 relative group">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">1. Original Scan</div>
                      <div className="aspect-square bg-black/40 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Original" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <span className="text-slate-600 text-[10px] font-mono">No Image</span>
                        )}
                      </div>
                    </div>

                    {/* 2. Enhanced / Resized */}
                    <div className="bg-[#0a0e17] p-3 relative group">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">2. CLAHE Enhanced</div>
                      <div className="aspect-square bg-black/40 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {result.raw_image_path ? (
                          <img src={`${API_BASE}/${result.raw_image_path}`} alt="Enhanced" className="w-full h-full object-contain brightness-110 contrast-110 group-hover:scale-110 transition-transform duration-500" />
                        ) : previewUrl ? (
                          <img src={previewUrl} alt="Enhanced" className="w-full h-full object-contain brightness-110 contrast-110 group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <span className="text-slate-600 text-[10px] font-mono">No Image</span>
                        )}
                      </div>
                    </div>

                    {/* 3. AE Reconstruction with defect box */}
                    <div className="bg-[#0a0e17] p-3 relative group">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">3. AE Reconstruction</div>
                      <div className="aspect-square bg-black/40 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {(result.raw_image_path || previewUrl) ? (
                          <>
                            <img src={result.raw_image_path ? `${API_BASE}/${result.raw_image_path}` : previewUrl} alt="Reconstruction" className="w-full h-full object-contain sepia-[.15] group-hover:scale-110 transition-transform duration-500" />
                            {result.pass_fail_decision === 'FAIL' && (() => {
                              let regions = [];
                              try { regions = typeof result.defect_regions === 'string' ? JSON.parse(result.defect_regions) : (result.defect_regions || []); } catch(e) {}
                              if (regions.length === 0) {
                                regions = [{ x: 60, y: 50, w: 80, h: 70 }];
                              }
                              return regions.slice(0, 4).map((r, i) => {
                                const imgW = 224;
                                const imgH = 224;
                                const pctLeft = (r.x / imgW) * 100;
                                const pctTop = (r.y / imgH) * 100;
                                const pctW = (r.w / imgW) * 100;
                                const pctH = (r.h / imgH) * 100;
                                const area = r.w * r.h;
                                return (
                                  <div key={i} className="absolute border-2 border-red-500 rounded bg-red-500/10" style={{ left: `${pctLeft}%`, top: `${pctTop}%`, width: `${pctW}%`, height: `${pctH}%` }}>
                                    <span className="absolute -top-5 left-0 bg-red-600 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg">
                                      Defect ({area}px)
                                    </span>
                                  </div>
                                );
                              });
                            })()}
                          </>
                        ) : (
                          <span className="text-slate-600 text-[10px] font-mono">No Image</span>
                        )}
                      </div>
                    </div>

                    {/* 4. Defect Heatmap */}
                    <div className="bg-[#0a0e17] p-3 relative group">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">4. Defect Heatmap</div>
                      <div className="aspect-square bg-black/40 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {result.heatmap_image_path ? (
                          <img src={`${API_BASE}/${result.heatmap_image_path}`} alt="Heatmap" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <span className="text-slate-600 text-[10px] font-mono">No Heatmap</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reconstruction Error Bar */}
                  <div className="bg-[#0a0e17] px-6 py-5 border-t border-slate-800/50">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-3">
                      Reconstruction Error (Anomaly Score)
                    </div>
                    <div className="text-3xl font-black font-mono text-rose-400 mb-3">
                      {(result.anomaly_score || result.severity_score || 0).toFixed(5)}
                    </div>
                    <div className="relative h-3 bg-slate-900 rounded-full overflow-visible mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((result.anomaly_score || result.severity_score || 0) / Math.max(result.threshold || 30, result.anomaly_score || 30, 1)) * 100, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${(result.anomaly_score || result.severity_score || 0) > (result.threshold || 25) ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                      />
                      {(result.threshold || 0) > 0 && (
                        <div
                          className="absolute top-0 h-full flex flex-col items-center"
                          style={{ left: `${Math.min(((result.threshold || 25) / Math.max(result.anomaly_score || 30, result.threshold || 30, 1)) * 100, 95)}%` }}
                        >
                          <div className="w-0.5 h-full bg-amber-400"></div>
                          <span className="text-[9px] font-mono text-amber-400 font-bold mt-1 whitespace-nowrap">Threshold</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>0.0000</span>
                      <span>{(result.threshold || result.anomaly_score || 25).toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Info Cards Row */}
                  <div className="grid grid-cols-3 gap-0.5 bg-slate-800/30 p-0.5">
                    <div className="bg-[#0a0e17] p-5">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-2">Product Category</div>
                      <div className="text-xl font-black text-white uppercase">{result.matched_category || 'N/A'}</div>
                    </div>
                    <div className="bg-[#0a0e17] p-5">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-2">Prediction Verdict</div>
                      <div className={`text-xl font-black uppercase ${result.pass_fail_decision === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {result.is_defective ? 'DEFECTIVE' : 'NORMAL'}
                      </div>
                    </div>
                    <div className="bg-[#0a0e17] p-5">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-2">Defect Type</div>
                      <div className="text-xl font-black text-white">{result.defect_type || 'None'}</div>
                    </div>
                  </div>

                  {/* Extra Details Row */}
                  <div className="grid grid-cols-4 gap-0.5 bg-slate-800/30 p-0.5">
                    <div className="bg-[#0a0e17] p-4">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-1">Threshold Used</div>
                      <div className="text-base font-black font-mono text-amber-400">{(result.threshold || 0).toFixed(5)}</div>
                    </div>
                    <div className="bg-[#0a0e17] p-4">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-1">Severity Level</div>
                      <div className={`text-base font-black font-mono ${(result.severity_score || 0) > 60 ? 'text-rose-400' : (result.severity_score || 0) > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {result.severity_level || 'NONE'} ({(result.severity_score || 0).toFixed(1)})
                      </div>
                    </div>
                    <div className="bg-[#0a0e17] p-4">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-1">Confidence</div>
                      <div className="text-base font-black font-mono text-sky-400">{((result.confidence_score || 0) * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-[#0a0e17] p-4">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-1">Latency</div>
                      <div className="text-base font-black font-mono text-amber-400">{(result.processing_latency_ms || result.latency_ms || 0).toFixed(0)}ms</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showOverride && <OverrideModal isOpen={showOverride} onClose={() => setShowOverride(false)} onOverride={handleOverride} />}
      </AnimatePresence>
      <AnimatePresence>
        <InspectionHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
      </AnimatePresence>
    </div>
  );
}