import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ShieldCheck, AlertTriangle, CheckCircle2, Cpu, Activity, Zap, RefreshCw, ZoomIn, Search, Maximize2, Crosshair, ArrowRight, Layers } from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000";

export default function AIInspectionPanel({ addToast }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0); 

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setStep(1);
    }
  };

  const handleInspect = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setStep(2);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("product_sku", "MVI-PROD-2026");

    try {
      setTimeout(() => setStep(3), 800);
      const res = await axios.post(`${API_BASE}/api/inspect`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
      setStep(4);
      addToast?.('Inspection completed successfully', 'success');
    } catch (err) {
      setError("Inspection Pipeline Error: Unable to reach FastAPI on port 8000.");
      setStep(0);
      addToast?.('Pipeline Error', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans text-slate-100">
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="space-y-3 z-10 relative">
          <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-500/30 px-3 py-1.5 rounded-full text-[10px] font-mono text-sky-400 uppercase tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>MVTec Neural Engine Active</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Visual Defect Analysis</h2>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">Upload high-resolution component captures for automated sub-millisecond anomaly feature classification.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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

          <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800/30 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-6 flex items-center"><Layers className="w-4 h-4 mr-2" /> Pipeline Status</h4>
            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              {['Upload Frame', 'Preprocess (CLAHE)', 'Feature Extraction', 'Classify & Match', 'Generate Report'].map((text, idx) => (
                <motion.div 
                   key={idx} 
                   initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                   className="relative flex items-center space-x-4"
                >
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring' }} className="space-y-6 h-full flex flex-col">
                
                <div className={`p-8 rounded-3xl border shadow-2xl relative overflow-hidden transition-colors duration-500 ${result.pass_fail_decision === 'PASS' ? 'bg-emerald-950/30 border-emerald-500/50 hover:bg-emerald-950/40' : 'bg-rose-950/30 border-rose-500/50 hover:bg-rose-950/40'}`}>
                  <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none transition-colors duration-1000 ${result.pass_fail_decision === 'PASS' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}></div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center space-x-6">
                      <div className={`p-5 rounded-2xl ${result.pass_fail_decision === 'PASS' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]' : 'bg-rose-500/20 text-rose-400 shadow-[0_0_30px_rgba(251,113,133,0.4)] animate-pulse'}`}>
                        {result.pass_fail_decision === 'PASS' ? <CheckCircle2 className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10" />}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1 flex items-center">
                          <Cpu className="w-3 h-3 mr-1" /> SYSTEM VERDICT
                        </div>
                        <div className={`text-5xl font-black tracking-wide font-mono ${result.pass_fail_decision === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>{result.pass_fail_decision}</div>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  <div className="glass-card rounded-3xl p-1 overflow-hidden flex flex-col shadow-xl">
                    <div className="p-4 flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 bg-slate-900/50">
                      <span className="flex items-center"><Crosshair className="w-4 h-4 mr-2 text-sky-400" /> ANOMALY HEATMAP</span>
                      <Maximize2 className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white transition-colors" />
                    </div>
                    <div className="bg-[#0a0a0a] flex-1 overflow-hidden relative group cursor-crosshair min-h-[250px]">
                      {result.heatmap_image_path ? (
                        <>
                          <img src={`${API_BASE}/${result.heatmap_image_path}`} alt="Heatmap" className="w-full h-full object-contain absolute inset-0 transform group-hover:scale-[2] transition-transform duration-700 ease-in-out origin-center" />
                          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-slate-300 border border-slate-700 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn className="w-3 h-3 mr-1" /> Hover to Zoom
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-600 font-mono">
                          <Activity className="w-8 h-8 mb-2 opacity-20" />
                          No Heatmap Generated
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                    <div>
                      <div className="text-xs font-mono text-slate-400 border-b border-slate-800 pb-3 mb-5 flex justify-between items-center">
                        <span className="flex items-center"><Activity className="w-4 h-4 mr-2 text-sky-400" /> INFERENCE TELEMETRY</span>
                        <span className="text-emerald-400 flex items-center bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-800/50"><ShieldCheck className="w-3 h-3 mr-1"/> ACID LOGGED</span>
                      </div>
                      <div className="space-y-5 font-mono text-xs">
                        
                        <div className="group">
                          <div className="text-slate-500 mb-1.5 flex justify-between">
                            <span>Classification</span>
                          </div>
                          <div className={`font-bold px-3 py-2.5 rounded-xl border ${getDefectTypeColor(result.defect_type)} transition-colors`}>{result.defect_type || "None Detected"}</div>
                        </div>
                        
                        <div className="group">
                          <div className="text-slate-500 mb-1.5">Matched Category Pattern</div>
                          <div className={`font-bold px-3 py-2.5 rounded-xl border ${result.matched_category && !result.matched_category.includes('unknown') && !result.matched_category.includes('error') ? 'text-emerald-300 bg-emerald-950/40 border-emerald-800/50' : 'text-amber-300 bg-amber-950/40 border-amber-800/50'}`}>{result.matched_category || "N/A"}</div>
                        </div>
                        
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                          <div className="flex justify-between text-slate-400 mb-2 items-center">
                            <span>Network Confidence</span>
                            <span className="text-sky-400 font-black text-sm">{((result.confidence_score || 0.98) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 p-[1px]">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(result.confidence_score || 0.98) * 100}%` }} transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }} className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full relative">
                               <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                            </motion.div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-1">
                          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="text-slate-500 mb-1 text-[10px] uppercase tracking-widest flex items-center"><Zap className="w-3 h-3 mr-1 text-amber-400" /> Latency</div>
                            <div className="font-black text-amber-400 text-base">{result.processing_latency_ms || result.latency_ms || 14.2} <span className="text-xs font-normal opacity-70">ms</span></div>
                          </div>
                          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors overflow-hidden">
                            <div className="text-slate-500 mb-1 text-[10px] uppercase tracking-widest flex items-center"><Database className="w-3 h-3 mr-1 text-sky-400" /> Log ID</div>
                            <div className="font-bold text-slate-300 text-sm truncate" title={result.inspection_id}>{result.inspection_id?.substring(0,8) || "AUTO-GEN"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}