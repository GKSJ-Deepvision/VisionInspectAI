import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Scan, 
  Layers, 
  Activity, 
  Database, 
  CheckCircle2, 
  Settings2, 
  BarChart3, 
  Terminal, 
  ShieldCheck, 
  ChevronRight,
  Eye
} from 'lucide-react';

export default function LandingPage({ onNavigateToAuth }) {
  const [scannedFrame, setScannedFrame] = useState(0);

  // Auto-cycle live scanner demonstration
  useEffect(() => {
    const timer = setInterval(() => {
      setScannedFrame((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const sampleInspections = [
    { id: "INS-2026-0891", status: "PASS", defect: "None", confidence: "98.4%", severity: "NONE" },
    { id: "INS-2026-0892", status: "FAIL", defect: "Surface Scratch", confidence: "94.2%", severity: "HIGH" },
    { id: "INS-2026-0893", status: "REVIEW", defect: "Pitting / Discoloration", confidence: "62.1%", severity: "MEDIUM" }
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Dynamic Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-0 w-[500px] h-[500px] bg-sky-500/5 blur-[140px] rounded-full pointer-events-none" />

      {/* --- HEADER --- */}
      <header className="border-b border-slate-800/80 bg-[#07090e]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 group-hover:scale-105 transition-all">
              <Scan className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold tracking-wider text-white text-base flex items-center gap-2">
                VISIONINSPECT <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">AI CORE</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight">INDUSTRIAL DEFECT ENGINE</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <button
              onClick={() => onNavigateToAuth('CLIENT')}
              className="hidden sm:block text-xs font-mono text-slate-300 hover:text-white px-4 py-2 rounded transition-colors"
            >
              System Docs
            </button>

            <button
              onClick={() => onNavigateToAuth('ENGINEER')}
              className="text-xs font-mono bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-2"
            >
              <span>ACCESS SYSTEM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 pt-20 pb-28 relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Action */}
          <div className="lg:col-span-7 space-y-8">
            
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2.5 border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 rounded-full text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HYBRID VISION & DEEP LEARNING ARCHITECTURE</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Automated Visual Quality Control. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                Built for Edge Speed.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed font-normal">
              Detect surface cracks, abrasions, and structural defects in real-time. Combines classical feature extraction with WideResNet-50 deep anomaly scoring and localized heatmaps.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateToAuth('CLIENT')}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-xl transition-colors flex items-center justify-center space-x-3 shadow-lg shadow-emerald-500/20"
              >
                <span>Launch Line Inspector</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateToAuth('ENGINEER')}
                className="px-8 py-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-mono text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <span>Quality Command Center</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </motion.button>
            </motion.div>

            {/* Live Stats Bar */}
            <motion.div variants={itemVariants} className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6 text-xs font-mono text-slate-400">
              <div>
                <span className="block text-slate-500 mb-1">FEATURE ENGINE</span>
                <span className="text-slate-200 font-bold text-sm">LBP + Sobel Edge</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1">ANOMALY DETECTOR</span>
                <span className="text-slate-200 font-bold text-sm">WideResNet-50</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-1">AUDIT TRAIL</span>
                <span className="text-slate-200 font-bold text-sm">SQLite Local Store</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Live Inspection Visualizer */}
          <motion.div variants={itemVariants} className="lg:col-span-5 relative">
            <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              
              {/* Card Top Strip */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-mono text-slate-400">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-slate-200 font-bold">LIVE_INSPECTION_FEED</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  SKU: MVI-PROD-2026
                </span>
              </div>

              {/* Simulated Optical Inspection Screen */}
              <div className="my-6 relative h-64 bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden flex items-center justify-center group">
                
                {/* Laser Scanning Line Animation */}
                <motion.div 
                  animate={{ y: [-130, 130, -130] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] z-20 pointer-events-none"
                />

                {/* Simulated Heatmap Box */}
                <div className="relative w-48 h-48 border border-slate-700/60 rounded-lg flex items-center justify-center bg-slate-900/40">
                  <Eye className="w-12 h-12 text-slate-600 animate-pulse" />
                  
                  {/* Localized Defect Highlight Box */}
                  {sampleInspections[scannedFrame].status !== "PASS" && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-8 right-8 w-16 h-16 border-2 border-amber-400 bg-amber-500/20 rounded flex items-center justify-center text-[9px] font-mono font-bold text-amber-300"
                    >
                      ANOMALY
                    </motion.div>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono text-slate-300 z-10">
                  Frame Capture: Active
                </div>
              </div>

              {/* Animated Live Status Switcher */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={scannedFrame}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl font-mono text-xs space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">RECORD ID:</span>
                    <span className="text-white font-bold">{sampleInspections[scannedFrame].id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">DECISION:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      sampleInspections[scannedFrame].status === 'PASS' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : sampleInspections[scannedFrame].status === 'FAIL' 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {sampleInspections[scannedFrame].status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">DEFECT TYPE:</span>
                    <span className="text-slate-200">{sampleInspections[scannedFrame].defect}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>
          </motion.div>

        </div>
      </motion.section>

      {/* --- FEATURE HIGHLIGHT MATRIX --- */}
      <section className="border-t border-slate-800/80 bg-[#090d16] py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block">PIPELINE INTEGRITY</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Engineered for Industrial Reliability</h2>
            <p className="text-slate-400 text-sm font-sans">
              Designed to process raw conveyor feeds, run feature analysis, render heatmaps, and maintain an immutable inspection audit trail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {[
              {
                icon: Layers,
                title: "Dual Feature Engine",
                desc: "Combines LBP texture parameters and Sobel edge density with deep spatial features for robust defect identification."
              },
              {
                icon: Activity,
                title: "Visual Heatmaps",
                desc: "Instant spatial anomaly map generation highlighting localized surface abrasions for clear operator verification."
              },
              {
                icon: Database,
                title: "ACID Audit Trail",
                desc: "Automated local SQLite logging records every inspection frame, decision score, and timestamp for shift reporting."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0f1420] border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition-colors relative group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-6 group-hover:border-emerald-500/40 transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-sans">
                  {feature.desc}
                </p>
              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* --- WORKSPACE PORTAL SELECTOR --- */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        
        <div className="mb-16 text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block">WORKSPACE ACCESS</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Select Operational Workspace</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Operator Portal */}
          <motion.div 
            whileHover={{ y: -8 }}
            onClick={() => onNavigateToAuth('CLIENT')}
            className="bg-[#0b0f19] border border-slate-800 hover:border-emerald-500/50 p-8 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-xl hover:shadow-emerald-500/5"
          >
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">OPERATOR</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Line Operator</h3>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Streamlined inspection station for uploading frames, conducting batch reviews, and getting instant PASS/FAIL decisions.
              </p>
            </div>
            <div className="mt-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
              <span>ENTER OPERATOR PORTAL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Engineer Portal */}
          <motion.div 
            whileHover={{ y: -8 }}
            onClick={() => onNavigateToAuth('ENGINEER')}
            className="bg-[#0b0f19] border border-slate-800 hover:border-emerald-500/50 p-8 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-xl hover:shadow-emerald-500/5"
          >
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Settings2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">ENGINEERING</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Quality Engineer</h3>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Diagnostic command center. Deep inspect heatmaps, adjust threshold parameters, and analyze texture feature distributions.
              </p>
            </div>
            <div className="mt-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
              <span>OPEN COMMAND CENTER</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Owner / Executive Portal */}
          <motion.div 
            whileHover={{ y: -8 }}
            onClick={() => onNavigateToAuth('OWNER')}
            className="bg-[#0b0f19] border border-slate-800 hover:border-emerald-500/50 p-8 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-xl hover:shadow-emerald-500/5"
          >
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold">EXECUTIVE</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Plant Operations</h3>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Executive analytics dashboard. Monitor line throughput, defect trends over time, and shift performance metrics.
              </p>
            </div>
            <div className="mt-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
              <span>VIEW EXECUTIVE DASHBOARD</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

        </div>

      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-800/80 bg-[#07090e] py-12 font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400 font-bold">VISIONINSPECT AI ENGINE</span>
          </div>
          <div className="flex space-x-6 text-slate-400">
            <span>FastAPI Core</span>
            <span>•</span>
            <span>PyTorch ML</span>
            <span>•</span>
            <span>React Industrial UI</span>
          </div>
        </div>
      </footer>

    </div>
  );
}