import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import AIInspectionPanel from './AIInspectionPanel';
import FactoryTelemetryCharts from './FactoryTelemetryCharts';
import { ClientOperatorView, OwnerExecutiveView } from './RoleViews';
import { Cpu, LogOut, User, Bell, Shield, AlertTriangle } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('LANDING');
  const [selectedAuthRole, setSelectedAuthRole] = useState('ENGINEER');
  const [currentUser, setCurrentUser] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Notification System
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleNavigate = (view, role = null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (role) setSelectedAuthRole(role);
      setCurrentView(view);
      setIsTransitioning(false);
    }, 600);
  };

  const handleAuthSuccess = (userSession) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentUser({ ...userSession, registeredRole: userSession.role });
      setCurrentView('DASHBOARD');
      setIsTransitioning(false);
      addToast(`Welcome back, ${userSession.role}`, 'success');
    }, 600);
  };

  const handleLogout = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentUser(null);
      setCurrentView('LANDING');
      setIsTransitioning(false);
    }, 600);
  };

  const renderView = () => {
    if (isTransitioning) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617]">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="loading-spinner w-16 h-16 border-4 border-sky-500/20 border-t-sky-500"></div>
              <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-sky-400 animate-pulse" />
            </div>
            <div className="text-sky-400 font-mono text-sm tracking-widest animate-pulse font-bold">ESTABLISHING SECURE UPLINK...</div>
          </div>
        </div>
      );
    }

    if (currentView === 'LANDING') {
      return (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
          <LandingPage onNavigateToAuth={(role) => handleNavigate('AUTH', role)} />
        </motion.div>
      );
    }

    if (currentView === 'AUTH') {
      return (
        <motion.div key="auth" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.5 }}>
          <AuthPage initialRole={selectedAuthRole} onBackToLanding={() => handleNavigate('LANDING')} onAuthSuccess={handleAuthSuccess} />
        </motion.div>
      );
    }

    return (
      <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="min-h-screen bg-[#020617] text-slate-100 font-sans pb-16 relative overflow-x-hidden">
        <div className="animated-bg-pattern"></div>
        
        <header className="border-b border-slate-800/80 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50 mb-10 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleNavigate('LANDING')}>
              <div className="relative p-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                <Cpu className="h-5 w-5 text-sky-400 group-hover:rotate-180 transition-transform duration-700" />
              </div>
              <span className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 font-mono">
                VISIONINSPECT AI
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-slate-800 transition-colors relative" onClick={() => addToast('System operating optimally', 'info')}>
                <Bell className="h-4 w-4 text-slate-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full animate-ping opacity-75"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full"></span>
              </button>

              {currentUser && (
                <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono shadow-inner">
                  <User className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-slate-300 font-bold">{currentUser?.name?.toUpperCase() || 'USER'}</span>
                  <span className="text-slate-600">|</span>
                  <Shield className={`h-3 w-3 ${currentUser.role === 'OWNER' ? 'text-amber-400' : currentUser.role === 'ENGINEER' ? 'text-indigo-400' : 'text-emerald-400'}`} />
                  <span className={`${currentUser.role === 'OWNER' ? 'text-amber-400' : currentUser.role === 'ENGINEER' ? 'text-indigo-400' : 'text-emerald-400'} font-bold tracking-wider`}>{currentUser.role}</span>
                </div>
              )}

              <select
                value={currentUser?.role || 'ENGINEER'}
                onChange={(e) => {
                  const newRole = e.target.value;
                  if (newRole === 'OWNER' && currentUser?.registeredRole !== 'OWNER') {
                    addToast('Owner access restricted. Only the Factory Owner can access this dashboard.', 'error');
                    return;
                  }
                  setCurrentUser({ ...currentUser, role: newRole });
                }}
                className="bg-slate-900 border border-slate-700 text-sky-400 font-mono text-xs rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer transition-all hover:bg-slate-800"
              >
                <option value="CLIENT">Role: Operator</option>
                <option value="ENGINEER">Role: Engineer</option>
                {currentUser?.registeredRole === 'OWNER' && <option value="OWNER">Role: Owner</option>}
              </select>

              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-xs font-mono bg-rose-950/40 hover:bg-rose-950/80 text-rose-400 border border-rose-900/50 hover:border-rose-700 px-3 py-1.5 rounded-lg transition-all hover:shadow-[0_0_15px_rgba(225,29,72,0.2)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="font-bold">EXIT</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 space-y-10 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div key={currentUser?.role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              {currentUser?.role === 'CLIENT' && <ClientOperatorView addToast={addToast} />}
              {currentUser?.role === 'ENGINEER' && (
                <div className="space-y-10">
                  <FactoryTelemetryCharts />
                  <AIInspectionPanel addToast={addToast} />
                </div>
              )}
              {currentUser?.role === 'OWNER' && <OwnerExecutiveView />}
            </motion.div>
          </AnimatePresence>
        </main>

        <div className="toast-container">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div key={toast.id} initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, x: 20 }} className={`px-4 py-3 rounded-xl shadow-2xl font-mono text-xs border flex items-center space-x-3 backdrop-blur-md ${toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : toast.type === 'error' ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' : 'bg-slate-900/90 border-slate-700 text-sky-400'}`}>
                {toast.type === 'success' && <Shield className="w-4 h-4 text-emerald-400" />}
                {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                {toast.type === 'info' && <Bell className="w-4 h-4 text-sky-400" />}
                <span className="font-bold">{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return <AnimatePresence mode="wait">{renderView()}</AnimatePresence>;
}