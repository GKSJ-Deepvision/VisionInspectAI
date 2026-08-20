import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck, AlertTriangle, Cpu, Activity, BarChart3,
  UploadCloud, FileText, CheckCircle2, XCircle, RefreshCw,
  LogOut, User, Lock, Layers, Eye, Download, SlidersHorizontal
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const API_BASE = 'http://localhost:8000';

const CATEGORIES = [
  "bottle", "cable", "capsule", "carpet", "grid",
  "hazelnut", "leather", "metal_nut", "pill", "screw",
  "tile", "toothbrush", "transistor", "wood", "zipper"
];

export default function App() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // App navigation state
  const [activeTab, setActiveTab] = useState('inspection'); // 'inspection' | 'dashboard' | 'history'

  // Live Inspection state
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [inspecting, setInspecting] = useState(false);
  const [result, setResult] = useState(null);

  // Manual Override state
  const [overrideDecision, setOverrideDecision] = useState(null);

  // Analytics & History state
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Active Quality Certificate Modal
  const [showCert, setShowCert] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchHistory();
    }
  }, [token]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const formData = new FormData();
      formData.append('username', authForm.username);
      formData.append('password', authForm.password);

      const res = await axios.post(`${API_BASE}/auth/login`, formData);
      const accessToken = res.data.access_token;
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      setAuthForm({ username: '', password: '' });
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Authentication failed');
    }
  };

  const handleDemoLogin = async (demoUsername, demoPassword) => {
    setAuthError('');
    try {
      const formData = new FormData();
      formData.append('username', demoUsername);
      formData.append('password', demoPassword);

      const res = await axios.post(`${API_BASE}/auth/login`, formData);
      const accessToken = res.data.access_token;
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
    } catch (err) {
      setAuthError(`Demo account '${demoUsername}' is missing. Please create it first!`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      handleLogout();
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE}/history?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setOverrideDecision(null);
    }
  };

  const runInspection = async () => {
    if (!selectedFile) return;
    setInspecting(true);
    setResult(null);
    setOverrideDecision(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', category);

    try {
      const res = await axios.post(`${API_BASE}/predict`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(res.data);
      fetchHistory(); // refresh audit logs
    } catch (err) {
      alert(err.response?.data?.detail || 'Inspection processing error');
    } finally {
      setInspecting(false);
    }
  };

  // Analytics Computation for Dashboard
  const totalInspections = history.length;
  const passCount = history.filter(h => h.pred_label === 'good' || h.pred_label === 'NORMAL' || h.pred_label === 'Normal').length;
  const failCount = totalInspections - passCount;
  const avgSeverity = totalInspections > 0
    ? (history.reduce((acc, curr) => acc + (curr.severity_score || 0), 0) / totalInspections).toFixed(1)
    : 0;

  const severityDistribution = [
    { name: 'Low', count: history.filter(h => h.severity_level === 'Low').length, color: '#10B981' },
    { name: 'Medium', count: history.filter(h => h.severity_level === 'Medium').length, color: '#F59E0B' },
    { name: 'High', count: history.filter(h => h.severity_level === 'High').length, color: '#EF4444' },
    { name: 'Critical', count: history.filter(h => h.severity_level === 'Critical').length, color: '#881337' },
  ];

  const passFailData = [
    { name: 'Pass', value: passCount, color: '#10B981' },
    { name: 'Defect', value: failCount, color: '#EF4444' }
  ];

  // Auth Screen if not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-950/50">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Cpu className="w-10 h-10 text-cyan-400 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-wider text-white">VISIONINSPECT AI</h1>
          </div>
          <p className="text-gray-400 text-center text-sm mb-8">
            Industrial Defect Detection & Quality Control System
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

         <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs text-cyan-400 font-mono uppercase mb-2">Username</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-400 transition"
                  placeholder="e.g. admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-cyan-400 font-mono uppercase mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-400 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-cyan-600/30 transition duration-200"
            >
              Sign In to Telemetry
            </button>

            <div className="pt-6 mt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center uppercase tracking-wider mb-4 font-mono">
                Evaluator Quick Access
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin', 'password123')}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-cyan-500/30 rounded-lg text-xs font-semibold text-cyan-400 transition"
                >
                  Admin View
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('supervisor', 'password123')}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs font-semibold text-gray-300 transition"
                >
                  Supervisor View
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-200 flex flex-col font-sans">
      {/* HUD Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cpu className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-lg font-bold tracking-wider text-white">VISIONINSPECT AI</h1>
              <span className="text-[10px] font-mono text-cyan-400/80 tracking-widest block">HUD TELEMETRY SYSTEM</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex bg-gray-900 border border-gray-800 rounded-lg p-1 space-x-1">
            <button
              onClick={() => setActiveTab('inspection')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${
                activeTab === 'inspection' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Live Console</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${
                activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Owner Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${
                activeTab === 'history' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Audit Logs</span>
            </button>
          </nav>

          {/* User Profile / Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-gray-200">{user?.username}</div>
              <div className="text-[10px] text-cyan-400 uppercase font-mono">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-gray-900 border border-gray-800 hover:border-red-500/50 hover:text-red-400 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* PAGE 1: LIVE INSPECTION CONSOLE */}
        {activeTab === 'inspection' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls & Upload Box */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Inspection Parameters
                </h2>

                {/* Category Dropdown */}
                <div className="mb-5">
                  <label className="block text-xs text-gray-400 mb-2">Target Product Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Drag & Drop Box */}
                <div className="mb-6">
                  <label className="block text-xs text-gray-400 mb-2">Product Image Stream</label>
                  <div className="relative border-2 border-dashed border-gray-700 hover:border-cyan-500/60 rounded-xl p-6 text-center bg-gray-950/40 transition group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition" />
                    <p className="text-sm text-gray-300 font-medium">Click or Drag Product Image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG (Max 10MB)</p>
                  </div>
                </div>

                {/* Trigger Inspection Button */}
                <button
                  onClick={runInspection}
                  disabled={!selectedFile || inspecting}
                  className={`w-full py-3.5 rounded-xl font-bold uppercase text-sm tracking-wider flex items-center justify-center space-x-2 transition ${
                    !selectedFile || inspecting
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-gray-950 shadow-lg shadow-cyan-500/20'
                  }`}
                >
                  {inspecting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Processing Vision Model...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      <span>Execute AI Inspection</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Display Console */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[480px]">
                <h2 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Live Visual Matrix
                </h2>

                {!imagePreview ? (
                  <div className="flex-1 flex flex-col items-center justify-center border border-gray-800/80 rounded-xl bg-gray-950/30 text-gray-600 p-8">
                    <Cpu className="w-16 h-16 stroke-[1.2] mb-3 text-gray-700" />
                    <p className="text-sm">No feed selected. Select an image to initialize standard HUD.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Visual Comparison Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Original Input */}
                      <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                        <span className="text-[10px] font-mono text-gray-400 uppercase block mb-2">Original Optical Feed</span>
                        <div className="h-48 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                          <img src={imagePreview} alt="Raw Input" className="max-h-full object-contain" />
                        </div>
                      </div>

                      {/* AI Thermal Heatmap Overlay */}
                      <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 relative">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-2">
                          PatchCore Heatmap Overlay
                        </span>
                        <div className="h-48 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                          {result?.heatmap_url ? (
                            <img
                              src={`${API_BASE}${result.heatmap_url}`}
                              alt="Heatmap Result"
                              className="max-h-full object-contain"
                            />
                          ) : (
                            <div className="text-xs text-gray-600 font-mono">Heatmap Pending Execution...</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inspection HUD Telemetry Results */}
                    {result && (
                      <div className="bg-gray-950/80 border border-cyan-500/30 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                          <div>
                            <span className="text-xs text-gray-400 font-mono">AI VERDICT:</span>
                            <div className="flex items-center space-x-2 mt-1">
                              {result.verdict === 'PASS' ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> PASS / ACCEPTED
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                                  <XCircle className="w-4 h-4 mr-1.5" /> DEFECT DETECTED
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-gray-400 font-mono">SEVERITY LEVEL:</span>
                            <div className="text-sm font-bold mt-1 text-cyan-300">
                              {result.severity_level || 'N/A'} ({result.severity_score || 0}/100)
                            </div>
                          </div>
                        </div>

                        {/* Action Recommendation */}
                        {result.recommended_action && (
                          <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-lg p-3 text-xs text-cyan-200">
                            <strong className="text-cyan-400">Action Protocol: </strong>
                            {result.recommended_action}
                          </div>
                        )}

                        {/* Manual Decision Override Bar */}
                        <div className="pt-2 border-t border-gray-800">
                          <span className="text-xs font-mono text-gray-400 block mb-2">MANUAL INSPECTOR OVERRIDE</span>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => setOverrideDecision('PASS')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                overrideDecision === 'PASS'
                                  ? 'bg-emerald-600 text-white border-emerald-400'
                                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-emerald-500'
                              }`}
                            >
                              Override PASS
                            </button>
                            <button
                              onClick={() => setOverrideDecision('FAIL')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                overrideDecision === 'FAIL'
                                  ? 'bg-red-600 text-white border-red-400'
                                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-red-500'
                              }`}
                            >
                              Override FAIL
                            </button>

                            <button
                              onClick={() => setShowCert(true)}
                              className="ml-auto bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Generate Certificate</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: OWNER DASHBOARD & ANALYTICS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 shadow-lg">
                <span className="text-xs font-mono text-gray-400 uppercase">Total Scans</span>
                <div className="text-3xl font-extrabold text-white mt-1">{totalInspections}</div>
                <div className="text-[10px] text-cyan-400 mt-2">Recorded System Wide</div>
              </div>

              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 shadow-lg">
                <span className="text-xs font-mono text-gray-400 uppercase">Passed Units</span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">{passCount}</div>
                <div className="text-[10px] text-emerald-500 mt-2">
                  {totalInspections > 0 ? ((passCount / totalInspections) * 100).toFixed(1) : 0}% Yield Rate
                </div>
              </div>

              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 shadow-lg">
                <span className="text-xs font-mono text-gray-400 uppercase">Defective Units</span>
                <div className="text-3xl font-extrabold text-red-400 mt-1">{failCount}</div>
                <div className="text-[10px] text-red-500 mt-2">Requires Rework/Scrap</div>
              </div>

              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 shadow-lg">
                <span className="text-xs font-mono text-gray-400 uppercase">Avg Severity Score</span>
                <div className="text-3xl font-extrabold text-cyan-400 mt-1">{avgSeverity}</div>
                <div className="text-[10px] text-cyan-500 mt-2">Scale (0 - 100)</div>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Pass / Fail Ratio Donut */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-4">
                  Pass vs. Defect Ratio
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={passFailData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {passFailData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Severity Distribution Bar Chart */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-4">
                  Defect Severity Breakdown
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={severityDistribution}>
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                      <Bar dataKey="count" fill="#06B6D4" radius={[6, 6, 0, 0]}>
                        {severityDistribution.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PAGE 3: AUDIT LOGS / HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-mono text-cyan-400 uppercase tracking-wider">
                Inspection Execution History
              </h2>
              <button
                onClick={fetchHistory}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-950/60 text-cyan-400 font-mono text-xs uppercase border-b border-gray-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Filename</th>
                    <th className="p-3">AI Verdict</th>
                    <th className="p-3">Severity Score</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {history.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/30 transition">
                      <td className="p-3 font-mono text-xs text-gray-500">#{log.id}</td>
                      <td className="p-3 font-semibold text-white capitalize">{log.category}</td>
                      <td className="p-3 text-xs text-gray-400 max-w-[150px] truncate">{log.filename}</td>
                      <td className="p-3">
                        {log.pred_label === 'good' || log.pred_label === 'NORMAL' || log.pred_label === 'Normal' ? (
                          <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-semibold border border-emerald-500/30">
                            PASS
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded font-semibold border border-red-500/30">
                            DEFECT
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono">{log.severity_score ?? 'N/A'}</td>
                      <td className="p-3 text-xs font-semibold">{log.severity_level ?? 'N/A'}</td>
                      <td className="p-3 text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 text-xs">
                        No inspection records stored in SQLite database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: PDF QUALITY CERTIFICATE */}
      {showCert && result && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-xl p-8 max-w-2xl w-full shadow-2xl relative" id="printable-certificate">
            <button
              onClick={() => setShowCert(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black print:hidden"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div className="border-b-2 border-cyan-600 pb-4 mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-wider">QUALITY INSPECTION CERTIFICATE</h2>
                <p className="text-xs text-cyan-700 font-mono">VISIONINSPECT AI AUTOMATED CONTROL SYSTEM</p>
              </div>
              <ShieldCheck className="w-12 h-12 text-cyan-600" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div><strong>Inspection ID:</strong> #{result.id || 'LIVE-01'}</div>
              <div><strong>Product Category:</strong> {result.category?.toUpperCase()}</div>
              <div><strong>Date & Time:</strong> {new Date().toLocaleString()}</div>
              <div><strong>Inspector:</strong> {user?.username} ({user?.role})</div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">AI Primary Verdict:</span>
                <span className={`px-3 py-1 text-xs font-bold rounded ${
                  (overrideDecision || result.verdict) === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {overrideDecision ? `OVERRIDDEN (${overrideDecision})` : result.verdict.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Severity Metric Score:</span>
                <span className="font-mono font-bold">{result.severity_score || '0.0'} / 100</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Severity Classification:</span>
                <span>{result.severity_level || 'Normal'}</span>
              </div>
            </div>

            {result.recommended_action && (
              <div className="mb-6 p-3 bg-cyan-50 border border-cyan-200 rounded text-xs text-cyan-900">
                <strong>Quality Protocol Action:</strong> {result.recommended_action}
              </div>
            )}

            <div className="flex justify-between items-end border-t pt-8 mt-8 text-xs text-gray-500">
              <div>
                <div className="border-b border-gray-400 w-40 mb-1"></div>
                <span>Authorized QA Signature</span>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 print:hidden"
              >
                <Download className="w-4 h-4" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}