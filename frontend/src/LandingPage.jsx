import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Cpu, Users, Building2, ArrowRight, ShieldCheck, Zap, Eye, Activity, Database, Server, Workflow } from 'lucide-react';

export default function LandingPage({ onNavigateToAuth }) {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const [typedText, setTypedText] = useState('');
  const fullText = "Conveyor Quality Control. Reimagined in AI.";

  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setTypedText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(intervalId);
    }, 50);
    return () => clearInterval(intervalId);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">
      <div className="particle-bg"></div>
      
      {/* Background Orbs */}
      <motion.div style={{ y: yBg }} className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-sky-600/10 blur-[150px] rounded-full pointer-events-none" />
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-50%']) }} className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <Cpu className="h-8 w-8 text-sky-400 group-hover:rotate-180 transition-transform duration-700" />
          <span className="text-xl font-black tracking-wider gradient-text-animated font-mono">VISIONINSPECT AI</span>
        </div>
        <button
          onClick={() => onNavigateToAuth('ENGINEER')}
          className="text-xs font-mono bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/50 px-5 py-2.5 rounded-xl transition-all font-bold tracking-wider hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]"
        >
          ACCESS PORTAL →
        </button>
      </header>

      {/* Hero Section */}
      <motion.section initial="hidden" animate="visible" variants={staggerContainer} className="max-w-6xl mx-auto px-6 pt-32 pb-24 text-center relative z-10 min-h-[80vh] flex flex-col justify-center">
        <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-full text-xs font-mono text-sky-400 mb-8 shadow-xl backdrop-blur-md hover:border-sky-500/50 transition-colors">
          <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
          <span>ADVANCED MVTec ANOMALY DETECTION ENGINE</span>
        </motion.div>

        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-tight mb-8 min-h-[160px] md:min-h-[100px]">
          {typedText}<span className="animate-pulse">_</span>
        </motion.h1>

        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          Experience real-time PyTorch inference directly on your manufacturing edge. Detect surface abrasions and structural defects with zero-latency visual heatmaps.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(56, 189, 248, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigateToAuth('ENGINEER')}
            className="py-4 px-8 rounded-2xl font-black tracking-wider text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center space-x-3 w-full sm:w-auto justify-center"
          >
            <span>INITIALIZE SYSTEM GATEWAY</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
          
          <div className="flex gap-2 text-xs font-mono text-slate-500">
            <span className="flex items-center bg-slate-900/50 border border-slate-800 px-3 py-2 rounded-lg backdrop-blur-sm"><ShieldCheck className="w-4 h-4 mr-1 text-emerald-400"/> 99.7% Accuracy</span>
            <span className="flex items-center bg-slate-900/50 border border-slate-800 px-3 py-2 rounded-lg backdrop-blur-sm"><Zap className="w-4 h-4 mr-1 text-amber-400"/> &lt;15ms Latency</span>
          </div>
        </motion.div>
      </motion.section>

      {/* Architecture Diagram Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="max-w-6xl mx-auto px-6 py-24 z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-xs font-mono text-sky-400 uppercase tracking-widest mb-2">NEURAL PIPELINE</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white">End-to-End Processing Architecture</h3>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
           <motion.div variants={fadeInUp} className="glass-card p-6 rounded-2xl text-center w-full md:w-64 hover:border-sky-500/50 transition-colors group">
             <Workflow className="w-10 h-10 mx-auto mb-4 text-sky-400 group-hover:scale-110 transition-transform" />
             <h4 className="font-bold text-lg mb-2">1. Ingestion</h4>
             <p className="text-xs text-slate-400">High-speed conveyor frame capture</p>
           </motion.div>
           <motion.div variants={fadeInUp} className="hidden md:block text-slate-600"><ArrowRight className="w-8 h-8"/></motion.div>
           <motion.div variants={fadeInUp} className="glass-card p-6 rounded-2xl text-center w-full md:w-64 hover:border-blue-500/50 transition-colors group">
             <Cpu className="w-10 h-10 mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
             <h4 className="font-bold text-lg mb-2">2. Inference</h4>
             <p className="text-xs text-slate-400">WideResNet-50 anomaly detection</p>
           </motion.div>
           <motion.div variants={fadeInUp} className="hidden md:block text-slate-600"><ArrowRight className="w-8 h-8"/></motion.div>
           <motion.div variants={fadeInUp} className="glass-card p-6 rounded-2xl text-center w-full md:w-64 hover:border-indigo-500/50 transition-colors group">
             <Database className="w-10 h-10 mx-auto mb-4 text-indigo-400 group-hover:scale-110 transition-transform" />
             <h4 className="font-bold text-lg mb-2">3. Logging</h4>
             <p className="text-xs text-slate-400">ACID SQLite Audit Trail</p>
           </motion.div>
        </div>
      </motion.section>

      {/* Role Selection Matrix */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="max-w-6xl mx-auto px-6 py-24 z-10 relative">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">CHOOSE YOUR WORKSPACE ROLE</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white">Tailored Portals for Every Stakeholder</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{ role: 'CLIENT', title: 'Line Operator', icon: Users, color: 'sky', desc: 'High-speed conveyor station interface. Upload frames for instant PASS/FAIL decisions.', label: 'ENTER OPERATOR PORTAL' },
            { role: 'ENGINEER', title: 'Quality Engineer', icon: Cpu, color: 'blue', desc: 'Diagnostic command center. Inspect heatmaps, adjust contrast, verify severity math.', label: 'LAUNCH COMMAND CENTER' },
            { role: 'OWNER', title: 'Factory Owner', icon: Building2, color: 'indigo', desc: 'Executive dashboard. Monitor shift OEE efficiency, ROI, and live database logs.', label: 'OPEN EXECUTIVE DASHBOARD' }
          ].map((item, idx) => (
            <motion.div 
              key={idx} variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02, rotateX: 5, rotateY: 5 }}
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              onClick={() => onNavigateToAuth(item.role)}
              className={`glass-card p-8 rounded-3xl cursor-pointer flex flex-col justify-between group relative overflow-hidden transition-all duration-300 border-slate-800 hover:border-${item.color}-500/50 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${item.color}-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0`}></div>
              <div>
                <div className={`h-16 w-16 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/30 flex items-center justify-center mb-6 text-${item.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h4 className={`text-2xl font-bold mb-3 text-white group-hover:text-${item.color}-400 transition-colors`}>{item.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
              <div className={`mt-8 flex items-center text-xs font-mono text-${item.color}-400 font-bold group-hover:translate-x-2 transition-transform`}>
                <span>{item.label} →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tech Stack Footer */}
      <footer className="border-t border-slate-900 py-12 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['React 19', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'FastAPI', 'PyTorch'].map((tech, i) => (
              <span key={i} className="px-3 py-1 bg-slate-900/50 border border-slate-800 rounded-full text-xs font-mono text-slate-400">{tech}</span>
            ))}
          </div>
          <div className="text-xs text-slate-600 font-mono flex flex-col items-center">
            <span>VISIONINSPECT AI // SCROLL-WORLD ANIMATION ARCHITECTURE</span>
            <div className="w-px h-12 bg-gradient-to-b from-slate-600 to-transparent mt-4"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}