import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Users, ArrowRight, Eye, Activity, Database, Workflow, 
  CheckCircle, BarChart, Scan, Layers, Brain, Gauge, 
  AlertTriangle, Target, ChevronDown, Factory, Cog, Globe, 
  Sparkles, ArrowUpRight, CircuitBoard 
} from 'lucide-react';
import factoryBg from './assets/factory_bg.jpg';

const EVALUATION_DATA = [
  { name: 'bottle', emoji: '🍾' },
  { name: 'cable', emoji: '🔌' },
  { name: 'capsule', emoji: '💊' },
  { name: 'carpet', emoji: '🟫' },
  { name: 'grid', emoji: '🔲' },
  { name: 'hazelnut', emoji: '🌰' },
  { name: 'leather', emoji: '👜' },
  { name: 'metal_nut', emoji: '🔩' },
  { name: 'pill', emoji: '💊' },
  { name: 'screw', emoji: '🔩' },
  { name: 'tile', emoji: '🔳' },
  { name: 'toothbrush', emoji: '🪥' },
  { name: 'transistor', emoji: '📻' },
  { name: 'wood', emoji: '🪵' },
  { name: 'zipper', emoji: '🤐' },
];

const CATEGORY_DETAILS = {
  bottle: { defects: 'Cracks, Contamination, Chips', resolution: '1024 x 1024 (HD)', type: 'Object Surface' },
  cable: { defects: 'Bent Wire, Missing Cable, Cut', resolution: '1024 x 1024 (HD)', type: 'Object Structure' },
  capsule: { defects: 'Squeeze, Crack, Color Inconsistency', resolution: '1024 x 1024 (HD)', type: 'Object Surface' },
  carpet: { defects: 'Hole, Metal, Cut, Thread Break', resolution: '1024 x 1024 (HD)', type: 'Texture / Fabric' },
  grid: { defects: 'Bent Grid, Broken Wire, Glue', resolution: '1024 x 1024 (HD)', type: 'Texture / Structural' },
  hazelnut: { defects: 'Hole, Crack, Print Defect', resolution: '1024 x 1024 (HD)', type: 'Object Organic' },
  leather: { defects: 'Cut, Fold, Glue, Color Fault', resolution: '1024 x 1024 (HD)', type: 'Texture Surface' },
  metal_nut: { defects: 'Scratch, Bent Nut, Color Fault', resolution: '1024 x 1024 (HD)', type: 'Object Metal' },
  pill: { defects: 'Crack, Color Fault, Contamination', resolution: '1024 x 1024 (HD)', type: 'Object Medical' },
  screw: { defects: 'Scratch, Thread Deformation', resolution: '1024 x 1024 (HD)', type: 'Object Metal' },
  tile: { defects: 'Crack, Glue, Gray Stroke, Oil', resolution: '1024 x 1024 (HD)', type: 'Texture Surface' },
  toothbrush: { defects: 'Defective Bristles, Color Fault', resolution: '1024 x 1024 (HD)', type: 'Object Structural' },
  transistor: { defects: 'Bent Lead, Cut Lead, Surface Damage', resolution: '1024 x 1024 (HD)', type: 'Object PCB' },
  wood: { defects: 'Hole, Scratch, Color Stain', resolution: '1024 x 1024 (HD)', type: 'Texture Organic' },
  zipper: { defects: 'Broken Tooth, Split Fabric', resolution: '1024 x 1024 (HD)', type: 'Object Composite' },
};

/* ─── INTRO SPLASH ─── */
const IntroSplash = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const callbackRef = useRef(onComplete);
  callbackRef.current = onComplete;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(() => callbackRef.current?.(), 3800);
    const safety = setTimeout(() => callbackRef.current?.(), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(safety); };
  }, []);

  return (
    <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #0a1628 0%, #020617 70%)' }}>
      
      {/* Grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Scan line */}
      <motion.div animate={{ top: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50 z-10" />

      {/* Corner brackets */}
      {phase >= 1 && <>
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-sky-500/60" />
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-sky-500/60" />
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-sky-500/60" />
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-sky-500/60" />
      </>}

      <div className="text-center relative z-20">
        <motion.div initial={{ opacity: 0 }} animate={phase >= 1 ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}
          className="text-xs font-mono tracking-[0.5em] text-sky-500/70 mb-6 uppercase">This Is</motion.div>

        <motion.h1 initial={{ opacity: 0, scale: 0.7, filter: 'blur(20px)' }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.8 }}
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-4 relative">
          <span className="text-white">Vision</span>
          <span className="text-sky-400 bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Inspect</span>
          <span className="text-white"> AI</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={phase >= 2 ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-slate-400 tracking-wide mb-8">Manufacturing Defect Detection & Quality Inspection</motion.p>

        <motion.div initial={{ opacity: 0 }} animate={phase >= 3 ? { opacity: 1 } : {}}
          className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
          <motion.div initial={{ width: '0%' }} animate={phase >= 3 ? { width: '100%' } : {}}
            transition={{ duration: 1.2 }} className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={phase >= 3 ? { opacity: 0.5 } : {}}
          className="text-[10px] font-mono text-slate-600 mt-3 tracking-widest">INITIALIZING INSPECTION ENGINE...</motion.p>
      </div>
    </motion.div>
  );
};

/* ─── Animated Counter ─── */
const AnimatedCounter = ({ value, label, suffix = '', icon: Icon, color = 'sky', delay = 0, isFloat = false }) => {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start, frame;
    const run = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      const current = value * (1 - Math.pow(1 - p, 3));
      setCount(isFloat ? current.toFixed(1) : Math.floor(current));
      if (p < 1) frame = requestAnimationFrame(run);
    };
    const t = setTimeout(() => { frame = requestAnimationFrame(run); }, delay * 1000);
    return () => { clearTimeout(t); if (frame) cancelAnimationFrame(frame); };
  }, [visible, value, delay, isFloat]);

  const colors = { 
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/30 hover:border-sky-400/60 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]', 
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/60 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]', 
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]', 
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-400/60 hover:shadow-[0_0_20px_rgba(129,140,248,0.2)]' 
  };
  const c = (colors[color] || colors.sky).split(' ');

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: delay * 0.5 }}
      className={`flex flex-col items-center p-6 rounded-2xl ${c.slice(1, 3).join(' ')} ${c.slice(3).join(' ')} border backdrop-blur-md group hover:-translate-y-1 transition-all duration-300`}>
      {Icon && <Icon className={`w-5 h-5 ${c[0]} mb-2 group-hover:scale-110 transition-transform`} />}
      <div className={`text-3xl md:text-4xl font-black ${c[0]} font-mono`}>{count}{suffix}</div>
      <div className="text-[9px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-1.5 font-bold">{label}</div>
    </motion.div>
  );
};

/* ─── MAIN LANDING PAGE ─── */
export default function LandingPage({ onNavigateToAuth }) {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.18], [1, 0.95]);

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } };

  const roles = [
    { 
      role: 'CLIENT', 
      title: 'Line Operator', 
      icon: Users, 
      color: 'sky', 
      gradient: 'from-sky-500 to-cyan-500', 
      borderHover: 'hover:border-sky-500/60 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]',
      desc: 'Upload images for instant AI-powered PASS/FAIL decisions.', 
      features: ['Quick Upload', 'Instant Results', 'Reports'] 
    },
    { 
      role: 'ENGINEER', 
      title: 'Quality Engineer', 
      icon: Activity, 
      color: 'indigo', 
      gradient: 'from-indigo-500 to-violet-500', 
      borderHover: 'hover:border-indigo-500/60 hover:shadow-[0_0_30px_rgba(129,140,248,0.2)]',
      desc: 'Deep-inspect heatmaps, defect telemetry, detection thresholds.', 
      features: ['Heatmap Analysis', 'Classification', 'Tuning'] 
    },
    { 
      role: 'OWNER', 
      title: 'Factory Owner', 
      icon: BarChart, 
      color: 'emerald', 
      gradient: 'from-emerald-500 to-teal-500', 
      borderHover: 'hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(52,211,153,0.2)]',
      desc: 'Executive Power BI-style analytics with full production KPIs.', 
      features: ['KPI Dashboard', 'Trends', 'Reports'] 
    },
  ];

  const useCases = [
    { icon: Factory, title: 'Automotive Parts', desc: 'Scratches, cracks, deformations on engine parts.', color: 'sky' },
    { icon: CircuitBoard, title: 'Electronics & PCB', desc: 'Solder defects, missing components, trace breaks.', color: 'indigo' },
    { icon: Cog, title: 'Metal Fabrication', desc: 'Inspect nuts, screws, machined parts.', color: 'amber' },
    { icon: Layers, title: 'Textiles & Leather', desc: 'Weaving defects, color inconsistencies.', color: 'emerald' },
    { icon: Eye, title: 'Pharmaceutical', desc: 'Pill coatings, capsule integrity.', color: 'rose' },
    { icon: Globe, title: 'Food & Beverage', desc: 'Bottle seals, container integrity.', color: 'violet' },
  ];

  return (
    <>
      <AnimatePresence>{showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}</AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={!showIntro ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#020617] text-slate-100 font-sans relative overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200">

        {/* ═══ HERO WITH HUD & FACTORY BG ═══ */}
        <div className="relative min-h-screen overflow-hidden flex flex-col justify-between">
          <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 pointer-events-none">
            <img src={factoryBg} alt="Factory background" className="w-full h-full object-cover opacity-25 filter contrast-125 brightness-75" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/80 to-[#020617]" />
          </motion.div>

          {/* HUD Tech Reticle Overlay */}
          <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(56,189,248,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            {/* Animated Laser Reticle Line */}
            <motion.div 
              animate={{ y: ['0%', '100%', '0%'] }} 
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-40 shadow-[0_0_15px_#38bdf8]" 
            />

            <div className="absolute top-20 left-10 hidden lg:block font-mono text-[9px] text-sky-500/40 space-y-1">
              <div>// LATENCY: 12ms</div>
              <div>// AI DEPLOYED: WRN-50-2</div>
              <div>// SENSOR: 4K-VISION-01</div>
            </div>

            <div className="absolute bottom-20 right-10 hidden lg:block font-mono text-[9px] text-sky-500/40 text-right space-y-1">
              <div>ACCURACY: 90.7% //</div>
              <div>MVTEC AD COMPLIANT //</div>
              <div>HUD MODE: ACTIVE //</div>
            </div>
          </div>

          <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-sky-500/10 blur-[160px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

          {/* Header */}
          <header className="relative z-20 border-b border-slate-800/60 bg-[#020617]/60 backdrop-blur-2xl px-6 md:px-10 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative p-2 bg-sky-500/10 rounded-xl border border-sky-500/30 group-hover:border-sky-400 transition-colors">
                <Cpu className="h-6 w-6 text-sky-400 group-hover:rotate-180 transition-transform duration-700" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-200 font-mono leading-none">VISIONINSPECT AI</span>
                <span className="text-[8px] font-mono text-slate-500 tracking-[0.3em] mt-1">QUALITY INTELLIGENCE PLATFORM</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden md:flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-emerald-500" /></span>
                SYSTEM ONLINE
              </span>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigateToAuth('ENGINEER')}
                className="text-xs font-mono bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 border border-sky-500/40 px-4 py-2.5 rounded-xl transition-all font-bold tracking-wider flex items-center group shadow-md hover:shadow-sky-500/20 cursor-pointer">
                ACCESS PORTAL <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </header>

          {/* Hero Content */}
          <motion.section style={{ opacity: opacityHero, scale: scaleHero }} className="relative z-10 max-w-7xl mx-auto px-6 pt-20 md:pt-32 pb-24 text-center flex flex-col justify-center items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-slate-900/80 border border-sky-500/30 px-4 py-2 rounded-full text-xs font-mono text-sky-400 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute h-full w-full rounded-full bg-sky-400 opacity-75" /><span className="relative rounded-full h-2.5 w-2.5 bg-sky-500" /></span>
                <span className="tracking-[0.15em]">MVTEC AD — 15 CATEGORY ANOMALY DETECTION</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl mx-auto leading-[1.05] mb-6">
                <span className="text-white drop-shadow-md">Manufacturing Defect Detection.</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 drop-shadow-[0_0_35px_rgba(56,189,248,0.3)]">Reimagined with AI.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
                Deploy <span className="text-sky-300 font-semibold border-b border-sky-500/40">WideResNet-50-2 PatchCore</span> inference to detect surface cracks, contamination, and structural defects across{' '}
                <span className="text-sky-400 font-semibold">15 product categories</span> — with real-time heatmaps and severity scoring.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(56,189,248,0.5)" }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => onNavigateToAuth('ENGINEER')}
                  className="py-4 px-10 rounded-2xl font-black tracking-widest text-sm bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center space-x-3 group border border-sky-300/50 cursor-pointer transition-all">
                  <Scan className="w-5 h-5 animate-pulse" />
                  <span>START INSPECTING</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.03 }} 
                  onClick={() => document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' })}
                  className="py-4 px-8 rounded-2xl font-bold tracking-wider text-sm bg-slate-900/80 text-slate-300 border border-slate-700/80 hover:border-slate-500 backdrop-blur-md flex items-center gap-2 cursor-pointer transition-colors">
                  EXPLORE PIPELINE <ChevronDown className="w-4 h-4 animate-bounce text-sky-400" />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.section>

          {/* Scroll Down Indicator */}
          <div className="pb-10 flex flex-col items-center gap-2 z-10 pointer-events-none">
            <span className="text-[8px] font-mono text-slate-500 tracking-[0.3em]">SCROLL TO EXPLORE</span>
            <div className="w-px h-8 bg-gradient-to-b from-sky-500 to-transparent" />
          </div>
        </div>

        {/* ═══ STATS BAR ═══ */}
        <section className="border-y border-slate-800/80 bg-slate-900/40 backdrop-blur-md py-14 z-10 relative">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnimatedCounter value={90.7} isFloat={true} suffix="%" label="Overall Accuracy (1565/1725)" icon={Target} color="sky" delay={0.1} />
            <AnimatedCounter value={15} suffix=" cat." label="Trained Categories" icon={Database} color="indigo" delay={0.3} />
            <AnimatedCounter value={1725} suffix="" label="Test Images Evaluated" icon={CheckCircle} color="emerald" delay={0.5} />
            <AnimatedCounter value={100} suffix="%" label="Top Category (Leather)" icon={Activity} color="amber" delay={0.7} />
          </div>
        </section>

        {/* ═══ PIPELINE WITH ANIMATED CONNECTOR FLOW ═══ */}
        <section id="pipeline" className="max-w-7xl mx-auto px-6 py-28 z-10 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] mb-4 shadow-[0_0_15px_rgba(129,140,248,0.15)]">
              <Workflow className="w-3.5 h-3.5" /> AI Inspection Pipeline
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white">End-to-End Processing</motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-slate-400 mt-3 max-w-2xl mx-auto">From image capture to automated quality decision in under 500ms</motion.p>
          </motion.div>

          <div className="relative mb-16">
            <div className="hidden md:block absolute top-[42px] left-[10%] right-[10%] h-[2px] bg-slate-800 z-0">
              <motion.div 
                animate={{ left: ['0%', '100%'] }} 
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 w-24 h-full bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_10px_#38bdf8]" 
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
              {[
                { s: '01', icon: Scan, t: 'Capture', d: 'Upload product images', c: 'sky' },
                { s: '02', icon: Layers, t: 'Preprocess', d: 'CLAHE, denoise, enhance', c: 'sky' },
                { s: '03', icon: Brain, t: 'PatchCore', d: 'WRN-50-2 patch features', c: 'indigo' },
                { s: '04', icon: AlertTriangle, t: 'Detect', d: 'Patch-level KNN scoring', c: 'amber' },
                { s: '05', icon: Gauge, t: 'Decision', d: 'PASS / FAIL + severity', c: 'emerald' },
              ].map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md hover:border-sky-500/50 hover:bg-slate-900/90 transition-all group hover:-translate-y-1">
                  <div className="relative w-14 h-14 rounded-xl bg-slate-900 border border-sky-500/30 flex items-center justify-center mb-3 group-hover:border-sky-400 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all">
                    <step.icon className="w-7 h-7 text-sky-400 group-hover:scale-110 transition-transform" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center text-[9px] font-black text-white shadow-md">{step.s}</div>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-0.5">{step.t}</h4>
                  <p className="text-[10px] text-slate-400 text-center">{step.d}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Cpu, title: 'PatchCore Features', desc: '196 patches × 1536-dim from WRN-50-2 layers 2+3. Captures LOCAL defects invisible to global features.', border: 'hover:border-sky-500/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.15)]' },
              { icon: Target, title: 'Ground-Truth Thresholds', desc: 'Optimal thresholds per category via 500-point grid search on MVTec test data.', border: 'hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(129,140,248,0.15)]' },
              { icon: Sparkles, title: 'Severity Scoring', desc: 'Size (30%) + Location (25%) + Type (25%) + Confidence (20%). NONE → LOW → MEDIUM → HIGH → CRITICAL.', border: 'hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(52,211,153,0.15)]' },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}
                className={`p-7 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md transition-all group ${card.border}`}>
                <card.icon className="w-7 h-7 text-sky-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white mb-2">{card.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ USE CASES ═══ */}
        <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] mb-4 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
              <Globe className="w-3.5 h-3.5" /> Industry Applications
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white">Built for Every Production Line</motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md hover:border-sky-500/40 hover:shadow-[0_0_25px_rgba(56,189,248,0.15)] transition-all group cursor-default">
                <uc.icon className="w-8 h-8 text-sky-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white mb-1.5 text-sm">{uc.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ COMMAND CENTER ROLES ═══ */}
        <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp} className="text-[10px] font-mono text-sky-400/80 uppercase tracking-[0.3em] mb-3">WORKSPACE ACCESS</motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white">Choose Your Command Center</motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.12 }}
                whileHover={{ y: -10, scale: 1.02 }} onClick={() => onNavigateToAuth(item.role)}
                className={`relative p-8 rounded-3xl cursor-pointer group overflow-hidden bg-slate-900/60 border border-slate-800 backdrop-blur-md transition-all duration-500 ${item.borderHover}`}>
                
                <div className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-br ${item.gradient} opacity-10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-25 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-6 text-sky-400 group-hover:border-sky-400 group-hover:scale-110 transition-transform shadow-inner">
                    <item.icon className="h-6 w-6" />
                  </div>

                  <h4 className="text-xl font-black tracking-tight mb-2 text-white group-hover:text-sky-300 transition-colors">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{item.desc}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.features.map((f, fi) => (
                      <span key={fi} className="text-[9px] font-mono px-2.5 py-1 rounded-full bg-slate-800/80 text-sky-300 border border-sky-500/20">{f}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-sky-400 font-bold relative z-10">
                  <span className="tracking-wider">ENTER PORTAL</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ MVTec CATEGORIES  ═══ */}
        <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] mb-4 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
              <Database className="w-3.5 h-3.5" /> Interactive Inspection Grid
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white">15 MVTec AD Categories</motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-slate-400 mt-3">Click any category card below to inspect defect profiles & inspection parameters</motion.p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3.5">
            {EVALUATION_DATA.map((item, i) => (
              <motion.div 
                key={item.name} 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(item)}
                className="relative flex flex-col items-center p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-sky-400/60 hover:bg-slate-900/90 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all group cursor-pointer">
                
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-2 group-hover:border-sky-400/50 transition-colors">
                  <span className="text-xl">{item.emoji}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-300 group-hover:text-white font-bold text-center capitalize mb-1">
                  {item.name.replace('_', ' ')}
                </span>

                <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                  INSPECT &rarr;
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-slate-800/80 bg-[#020617] py-14 relative z-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6">TECHNOLOGY STACK</div>
            <div className="flex flex-wrap justify-center gap-2.5 mb-10">
              {[['PyTorch','ML'],['WRN-50-2','Model'],['PatchCore','AD'],['OpenCV','Vision'],['FastAPI','API'],['React 19','UI'],['Vite','Build'],['Tailwind v4','CSS'],['Framer Motion','Anim'],['Recharts','Data'],['SQLite','DB'],['MVTec AD','Data']].map(([n,c], i) => (
                <motion.span key={i} whileHover={{ scale: 1.1, y: -2 }}
                  className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 cursor-default hover:border-sky-500/50 hover:text-sky-400 transition-all flex items-center gap-1.5">
                  <span className="text-[7px] text-slate-500 font-bold uppercase">{c}</span>{n}
                </motion.span>
              ))}
            </div>
            <div className="text-[9px] text-slate-600 font-mono">VISIONINSPECT AI // v2.0.0 // GKSJ-DEEPVISION</div>
          </div>
        </footer>

        {/* ═══ HUD CATEGORY TELEMETRY MODAL ═══ */}
        <AnimatePresence>
          {selectedCategory && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              {/* Backdrop overlay click to dismiss */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setSelectedCategory(null)} 
                className="absolute inset-0" 
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                transition={{ type: "spring", duration: 0.5 }}
                className="relative z-10 w-full max-w-md bg-[#0a101f] border border-sky-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(56,189,248,0.25)] font-mono">
                
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-2xl shadow-inner">
                      {selectedCategory.emoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white capitalize tracking-wide">
                        {selectedCategory.name.replace('_', ' ')}
                      </h3>
                      <p className="text-[10px] text-sky-400 tracking-widest uppercase">
                        MVTEC AD MODEL TELEMETRY
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedCategory(null)} 
                    className="text-slate-500 hover:text-white p-1.5 rounded-lg transition-colors text-base cursor-pointer">
                    ✕
                  </button>
                </div>

                {/* Telemetry Info Cards */}
                <div className="space-y-3 mb-6">
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">DETECTABLE DEFECTS:</span>
                    <span className="text-[11px] text-sky-300 font-bold max-w-[190px] text-right truncate">
                      {CATEGORY_DETAILS[selectedCategory.name]?.defects || 'Surface Anomalies'}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">INSPECTION TYPE:</span>
                    <span className="text-[11px] text-emerald-400 font-bold">
                      {CATEGORY_DETAILS[selectedCategory.name]?.type || 'PatchCore KNN'}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">RECOMMENDED RES:</span>
                    <span className="text-[11px] text-amber-400 font-bold">
                      {CATEGORY_DETAILS[selectedCategory.name]?.resolution || '1024 x 1024'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => {
                    setSelectedCategory(null);
                    onNavigateToAuth('ENGINEER');
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer">
                  <span>OPEN IN INSPECTOR PORTAL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </>
  );
}