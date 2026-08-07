import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Cpu, Users, ArrowRight, Eye, Activity, Database, Workflow, CheckCircle, BarChart, Scan, Layers, Brain, Gauge, AlertTriangle, Target, ChevronDown, Factory, Cog, Globe, Sparkles, ArrowUpRight, CircuitBoard } from 'lucide-react';
import factoryBg from './assets/factory_bg.jpg';

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
    // Safety: force complete after 5s no matter what
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
          <span className="text-green-400 bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Inspect</span>
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
const AnimatedCounter = ({ value, label, suffix = '', icon: Icon, color = 'sky', delay = 0 }) => {
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
    const run = (ts) => { if (!start) start = ts; const p = Math.min((ts - start) / 2000, 1); setCount(Math.floor(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) frame = requestAnimationFrame(run); };
    const t = setTimeout(() => { frame = requestAnimationFrame(run); }, delay * 1000);
    return () => { clearTimeout(t); if (frame) cancelAnimationFrame(frame); };
  }, [visible, value, delay]);
  const colors = { sky: 'text-sky-400 bg-sky-500/10 border-sky-500/30', emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30', indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
  const c = (colors[color] || colors.sky).split(' ');
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: delay * 0.5 }}
      className={`flex flex-col items-center p-6 rounded-2xl ${c.slice(1).join(' ')} border backdrop-blur-sm group hover:scale-105 transition-transform duration-300`}>
      {Icon && <Icon className={`w-5 h-5 ${c[0]} mb-2`} />}
      <div className={`text-3xl md:text-4xl font-black ${c[0]} font-mono`}>{count}{suffix}</div>
      <div className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1.5 font-bold">{label}</div>
    </motion.div>
  );
};

/* ─── MAIN ─── */
export default function LandingPage({ onNavigateToAuth }) {
  const [showIntro, setShowIntro] = useState(true);
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } };

  const roles = [
    { role: 'CLIENT', title: 'Line Operator', icon: Users, color: 'sky', gradient: 'from-sky-500 to-cyan-500', desc: 'Upload images for instant AI-powered PASS/FAIL decisions.', features: ['Quick Upload', 'Instant Results', 'Reports'] },
    { role: 'ENGINEER', title: 'Quality Engineer', icon: Activity, color: 'indigo', gradient: 'from-indigo-500 to-violet-500', desc: 'Deep-inspect heatmaps, defect telemetry, detection thresholds.', features: ['Heatmap Analysis', 'Classification', 'Tuning'] },
    { role: 'OWNER', title: 'Factory Owner', icon: BarChart, color: 'emerald', gradient: 'from-emerald-500 to-teal-500', desc: 'Executive Power BI-style analytics with full production KPIs.', features: ['KPI Dashboard', 'Trends', 'Reports'] },
  ];

  const useCases = [
    { icon: Factory, title: 'Automotive Parts', desc: 'Scratches, cracks, deformations on engine parts.', color: 'sky' },
    { icon: CircuitBoard, title: 'Electronics & PCB', desc: 'Solder defects, missing components, trace breaks.', color: 'indigo' },
    { icon: Cog, title: 'Metal Fabrication', desc: 'Inspect nuts, screws, machined parts.', color: 'amber' },
    { icon: Layers, title: 'Textiles & Leather', desc: 'Weaving defects, color inconsistencies.', color: 'emerald' },
    { icon: Eye, title: 'Pharmaceutical', desc: 'Pill coatings, capsule integrity.', color: 'rose' },
    { icon: Globe, title: 'Food & Beverage', desc: 'Bottle seals, container integrity.', color: 'violet' },
  ];

  const categories = ['bottle', 'cable', 'capsule', 'carpet', 'grid', 'hazelnut', 'leather', 'metal_nut', 'pill', 'screw', 'tile', 'toothbrush', 'transistor', 'wood', 'zipper'];
  const catEmojis = ['🍾','🔌','💊','🟫','🔲','🌰','👜','🔩','💊','🔩','🔳','🪥','📻','🪵','🤐'];

  return (
    <>
      <AnimatePresence>{showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}</AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={!showIntro ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#020617] text-slate-100 font-sans relative overflow-x-hidden">

        {/* ═══ HERO WITH FACTORY BG ═══ */}
        <div className="relative min-h-screen overflow-hidden">
          <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
            <img src={factoryBg} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/60 to-[#020617]" />
          </motion.div>

          <div className="absolute inset-0 z-[1] opacity-15" style={{ backgroundImage: 'radial-gradient(rgba(56,189,248,0.12) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-sky-600/8 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-indigo-600/8 blur-[130px] rounded-full pointer-events-none" />

          {/* Header */}
          <header className="relative z-20 border-b border-slate-800/40 bg-[#020617]/40 backdrop-blur-2xl px-6 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative p-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                <Cpu className="h-6 w-6 text-sky-400 group-hover:rotate-180 transition-transform duration-700" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 font-mono leading-none">VISIONINSPECT AI</span>
                <span className="text-[8px] font-mono text-slate-500 tracking-[0.3em]">QUALITY INTELLIGENCE PLATFORM</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:flex items-center gap-2 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-emerald-500" /></span>
                SYSTEM ONLINE
              </span>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigateToAuth('ENGINEER')}
                className="text-xs font-mono bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-4 py-2 rounded-xl transition-all font-bold tracking-wider flex items-center group">
                ACCESS PORTAL <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </header>

          {/* Hero */}
          <motion.section style={{ opacity: opacityHero, scale: scaleHero }} className="relative z-10 max-w-7xl mx-auto px-6 pt-24 md:pt-36 pb-32 text-center flex flex-col justify-center items-center min-h-[85vh]">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-slate-900/60 border border-slate-700/50 px-4 py-2 rounded-full text-xs font-mono text-sky-400 mb-8 backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute h-full w-full rounded-full bg-sky-400 opacity-75" /><span className="relative rounded-full h-2.5 w-2.5 bg-sky-500" /></span>
                <span className="tracking-[0.15em]">MVTEC AD — 15 CATEGORY ANOMALY DETECTION</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl mx-auto leading-[1.05] mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">Manufacturing Defect Detection.</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Reimagined with AI.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
                Deploy <span className="text-white font-semibold">WideResNet-50-2 PatchCore</span> inference to detect surface cracks, contamination, and structural defects across{' '}
                <span className="text-sky-400 font-semibold">15 product categories</span> — with real-time heatmaps and severity scoring.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(56,189,248,0.4)" }} whileTap={{ scale: 0.95 }} onClick={() => onNavigateToAuth('ENGINEER')}
                  className="py-4 px-10 rounded-2xl font-black tracking-widest text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center space-x-3 group border border-sky-400/50">
                  <Scan className="w-5 h-5" /><span>START INSPECTING</span><ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} onClick={() => document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' })}
                  className="py-4 px-8 rounded-2xl font-bold tracking-wider text-sm bg-slate-900/60 text-slate-300 border border-slate-700 backdrop-blur-sm flex items-center gap-2">
                  EXPLORE PIPELINE <ChevronDown className="w-4 h-4 animate-bounce" />
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <span className="text-[8px] font-mono text-slate-600 tracking-[0.3em]">SCROLL</span>
              <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
            </motion.div>
          </motion.section>
        </div>

        {/* ═══ STATS ═══ */}
        <section className="border-y border-slate-800/50 bg-slate-900/20 backdrop-blur-sm py-14 z-10 relative">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnimatedCounter value={95} suffix="%" label="Detection Accuracy" icon={Target} color="sky" delay={0.1} />
            <AnimatedCounter value={15} suffix=" cat." label="Trained Categories" icon={Database} color="indigo" delay={0.3} />
            <AnimatedCounter value={1725} suffix="" label="Test Images Validated" icon={CheckCircle} color="emerald" delay={0.5} />
            <AnimatedCounter value={24} suffix="/7" label="Continuous Monitoring" icon={Activity} color="amber" delay={0.7} />
          </div>
        </section>

        {/* ═══ PIPELINE ═══ */}
        <section id="pipeline" className="max-w-7xl mx-auto px-6 py-28 z-10 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] mb-4">
              <Workflow className="w-3.5 h-3.5" /> AI Inspection Pipeline
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white">End-to-End Processing</motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-slate-400 mt-3 max-w-2xl mx-auto">From image capture to automated quality decision in under 500ms</motion.p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {[
              { s: '01', icon: Scan, t: 'Capture', d: 'Upload product images', c: 'sky' },
              { s: '02', icon: Layers, t: 'Preprocess', d: 'CLAHE, denoise, enhance', c: 'sky' },
              { s: '03', icon: Brain, t: 'PatchCore', d: 'WRN-50-2 patch features', c: 'indigo' },
              { s: '04', icon: AlertTriangle, t: 'Detect', d: 'Patch-level KNN scoring', c: 'amber' },
              { s: '05', icon: Gauge, t: 'Decision', d: 'PASS / FAIL + severity', c: 'emerald' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center p-5 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm hover:border-sky-500/30 transition-all group">
                <div className="relative w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <step.icon className="w-7 h-7 text-sky-400" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center text-[9px] font-black text-white">{step.s}</div>
                </div>
                <h4 className="font-bold text-sm text-white mb-0.5">{step.t}</h4>
                <p className="text-[10px] text-slate-500 text-center">{step.d}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Cpu, title: 'PatchCore Features', desc: '196 patches × 1536-dim from WRN-50-2 layers 2+3. Captures LOCAL defects invisible to global features.', c: 'sky' },
              { icon: Target, title: 'Ground-Truth Thresholds', desc: 'Optimal thresholds per category via 500-point grid search on MVTec test data.', c: 'indigo' },
              { icon: Sparkles, title: 'Severity Scoring', desc: 'Size (30%) + Location (25%) + Type (25%) + Confidence (20%). NONE → LOW → MEDIUM → HIGH → CRITICAL.', c: 'emerald' },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}
                className="glass-card p-7 rounded-2xl hover:border-sky-500/30 transition-all group">
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
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] mb-4">
              <Globe className="w-3.5 h-3.5" /> Industry Applications
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white">Built for Every Production Line</motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-sky-500/30 transition-all group cursor-default">
                <uc.icon className="w-8 h-8 text-sky-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white mb-1.5 text-sm">{uc.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ ROLES ═══ */}
        <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp} className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-3">WORKSPACE ACCESS</motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white">Choose Your Command Center</motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {roles.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.12 }}
                whileHover={{ y: -10, scale: 1.02 }} onClick={() => onNavigateToAuth(item.role)}
                className="relative p-7 rounded-3xl cursor-pointer group overflow-hidden bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-600 transition-all duration-500 shadow-xl">
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${item.gradient} opacity-5 rounded-full blur-3xl -mr-14 -mt-14 group-hover:opacity-15 transition-opacity`} />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-5 text-sky-400 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-black tracking-tight mb-2 text-white">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">{item.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {item.features.map((f, fi) => (
                      <span key={fi} className="text-[9px] font-mono px-2 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-sky-400 font-bold relative z-10">
                  <span className="tracking-wider">ENTER PORTAL</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ MVTec CATEGORIES ═══ */}
        <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] mb-4">
              <Database className="w-3.5 h-3.5" /> Dataset Dashboard
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white">15 MVTec AD Categories</motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-slate-400 mt-3">Each category trained with PatchCore ground-truth-optimized thresholds</motion.p>
          </motion.div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {categories.map((cat, i) => (
              <motion.div key={cat} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="flex flex-col items-center p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-sky-500/40 transition-all group cursor-default">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center mb-2 group-hover:bg-sky-500/20 transition-colors">
                  <span className="text-lg">{catEmojis[i]}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-300 font-bold text-center capitalize">{cat.replace('_', ' ')}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-slate-800/50 bg-[#020617] py-14 relative z-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.3em] mb-6">TECHNOLOGY STACK</div>
            <div className="flex flex-wrap justify-center gap-2.5 mb-10">
              {[['PyTorch','ML'],['WRN-50-2','Model'],['PatchCore','AD'],['OpenCV','Vision'],['FastAPI','API'],['React 19','UI'],['Vite','Build'],['Tailwind v4','CSS'],['Framer Motion','Anim'],['Recharts','Data'],['SQLite','DB'],['MVTec AD','Data']].map(([n,c], i) => (
                <motion.span key={i} whileHover={{ scale: 1.1, y: -2 }}
                  className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 cursor-default hover:border-sky-500/40 hover:text-sky-400 transition-all flex items-center gap-1.5">
                  <span className="text-[7px] text-slate-600 font-bold uppercase">{c}</span>{n}
                </motion.span>
              ))}
            </div>
            <div className="text-[9px] text-slate-700 font-mono">VISIONINSPECT AI // v2.0.0 // GKSJ-DEEPVISION</div>
          </div>
        </footer>
      </motion.div>
    </>
  );
}