import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Mail, Lock, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import factoryBg from './assets/factory_bg.jpg';

const API_BASE = "http://127.0.0.1:8000";

export default function AuthPage({ initialRole, onAuthSuccess, onBackToLanding }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: initialRole || 'ENGINEER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const res = await axios.post(`${API_BASE}/api/auth/register`, {
          full_name: formData.fullName, email: formData.email, password: formData.password, role: formData.role
        });
        setSuccessMsg("Account registered in SQLite! Launching workspace...");
        setTimeout(() => onAuthSuccess(res.data.user), 1500);
      } else {
        const res = await axios.post(`${API_BASE}/api/auth/login`, {
          email: formData.email, password: formData.password
        });
        setSuccessMsg("Credentials verified! Accessing control room...");
        setTimeout(() => onAuthSuccess(res.data.user), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Connection refused. Is FastAPI running on port 8000?");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Animated Factory Background */}
      <div className="absolute inset-0 z-0">
        <img src={factoryBg} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/60 via-[#020617]/80 to-[#020617]/95" />
      </div>

      {/* Animated grid overlay */}
      <div className="absolute inset-0 z-[1] opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(56,189,248,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.15) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Floating orbs */}
      <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none z-[1]" />
      <motion.div animate={{ y: [0, 15, 0], x: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-[1]" />

      {/* Scan line */}
      <motion.div animate={{ top: ['0%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent z-[2]" />

      {/* Corner brackets */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-sky-500/30 z-[2]" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-sky-500/30 z-[2]" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-sky-500/30 z-[2]" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-sky-500/30 z-[2]" />

      <nav className="p-6 flex items-center justify-between border-b border-slate-800/60 bg-[#020617]/40 backdrop-blur-xl z-10">
        <div onClick={onBackToLanding} className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative p-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
            <Cpu className="h-6 w-6 text-sky-400 group-hover:rotate-180 transition-transform duration-700" />
          </div>
          <span className="font-mono font-black tracking-wider text-lg text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">VISIONINSPECT AI</span>
        </div>
        <button onClick={onBackToLanding} className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center">
          ← BACK
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl p-8 relative bg-slate-900/50 backdrop-blur-2xl border border-slate-700/50 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          
          {/* Glow border effect on hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ boxShadow: '0 0 30px rgba(56,189,248,0.1), inset 0 0 30px rgba(56,189,248,0.05)' }} />

          <div className="flex border-b border-slate-800 mb-8 font-mono text-sm relative">
            {['REGISTER', 'SIGN IN'].map((tab, idx) => {
              const isActive = (idx === 0 && isRegistering) || (idx === 1 && !isRegistering);
              return (
                <button key={tab} type="button" onClick={() => { setIsRegistering(idx === 0); setError(null); setSuccessMsg(null); }} className={`flex-1 py-3 font-bold transition-colors relative ${isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}>
                  {tab}
                  {isActive && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400" />}
                </button>
              );
            })}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight">{isRegistering ? "Create Session" : "Authenticate"}</h2>
            <p className="text-xs text-slate-400 mt-1">Secure AES-256 encrypted access portal.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center space-x-2 font-mono">
                  <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
                </div>
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-4">
                <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-lg text-emerald-300 text-xs flex items-center justify-center space-x-2 font-mono shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                  <CheckCircle className="h-5 w-5 shrink-0 animate-bounce" /><span className="font-bold">{successMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {isRegistering && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1">Operator ID</label>
                  <div className="relative rounded-xl group">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                    <input type="text" required={isRegistering} placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-sky-500 focus:shadow-[0_0_15px_rgba(56,189,248,0.15)] transition-all" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1">Corporate Email</label>
              <div className="relative rounded-xl group">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                <input type="email" required placeholder="user@visioninspect.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-sky-500 focus:shadow-[0_0_15px_rgba(56,189,248,0.15)] transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1">Passcode</label>
              <div className="relative rounded-xl group">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                <input type="password" required placeholder="••••••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-sky-500 focus:shadow-[0_0_15px_rgba(56,189,248,0.15)] transition-all" />
              </div>
            </div>

            <AnimatePresence>
              {isRegistering && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1">Workspace Assignment</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-sky-500 font-mono text-sky-400 cursor-pointer appearance-none">
                    <option value="CLIENT">Line Operator (Conveyor #1)</option>
                    <option value="ENGINEER">Quality Engineer (Diag Suite)</option>
                    <option value="OWNER">Factory Owner (Exec Dash)</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading || successMsg} className="w-full mt-4 py-4 rounded-xl font-black tracking-widest text-xs transition-all bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] flex items-center justify-center space-x-2 disabled:opacity-50 group">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span>{isRegistering ? "INITIALIZE CLEARANCE" : "VERIFY IDENTITY"}</span>}
              {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center text-[10px] font-mono text-slate-500">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" /> SECURE SQLITE CONNECTION
          </div>
        </motion.div>
      </main>
      
      <footer className="p-6 text-center text-xs text-slate-600 font-mono z-10">
        VISIONINSPECT AI // ENTERPRISE SECURITY GATEWAY
      </footer>
    </div>
  );
}