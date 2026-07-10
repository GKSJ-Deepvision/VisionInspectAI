import React, { useState } from 'react';
import axios from 'axios';
import { 
  UploadCloud, CheckCircle, AlertCircle, FileText, RefreshCw, 
  ShieldCheck, Activity, Layers, Image as ImageIcon, Lock, User, 
  LogOut, BarChart3, Users, Eye, CheckCircle2, XCircle
} from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null); // { username: 'kanna', role: 'owner', token: '...' }
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('quality_engineer');
  const [authError, setAuthError] = useState(null);

  // Dashboard state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Handle Register & Login
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === 'register') {
        await axios.post('http://127.0.0.1:8000/api/auth/register', { username, password, role });
        setAuthMode('login');
        alert("Registration successful! Please log in.");
      } else {
        const res = await axios.post('http://127.0.0.1:8000/api/auth/login', { username, password });
        setCurrentUser(res.data);
      }
    } catch (err) {
      setAuthError(err.response?.data?.detail || "Authentication failed. Check server.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
      setHistory(prev => [response.data, ...prev]);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  // --- IF NOT LOGGED IN: SHOW LOGIN/REGISTER SCREEN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">VisionInspect AI</h1>
            <p className="text-sm text-slate-400">Industry 4.0 Authentication Portal</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Username / ID</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" />
                <input 
                  type="text" required value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your ID..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" />
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Select Interface Role</label>
                <select 
                  value={role} onChange={e => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="quality_engineer">Quality Engineer (Active Inspector)</option>
                  <option value="owner">Factory Owner / Supervisor (Analytics & Admin)</option>
                  <option value="client">Client / Buyer (Read-Only Quality Reports)</option>
                </select>
              </div>
            )}

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-sm shadow-lg shadow-blue-600/20 transition-all">
              {authMode === 'login' ? 'Access Workspace' : 'Register Account'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-700/60">
            <button 
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(null); }}
              className="text-xs text-blue-400 hover:underline font-medium"
            >
              {authMode === 'login' ? 'Need an account? Register new Role' : 'Already registered? Log In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- IF LOGGED IN: SHOW ROLE-SPECIFIC WORKSPACE ---
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* TOP NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-950 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">VisionInspect AI</h1>
              <p className="text-xs text-slate-400">Industry 4.0 Quality Inspection Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
              Backend API Online
            </span>

            <div className="text-right border-l border-slate-800 pl-6 flex items-center space-x-4">
              <div>
                <p className="text-sm font-bold text-white capitalize">{currentUser.username}</p>
                <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">
                  Role: {currentUser.role.replace('_', ' ')}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                title="Log Out"
                className="p-2 bg-slate-800 hover:bg-red-600/80 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA BY ROLE */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ROLE 1: FACTORY OWNER / SUPERVISOR VIEW */}
        {currentUser.role === 'owner' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold flex items-center text-blue-400 mb-4">
                <BarChart3 className="w-5 h-5 mr-2" />
                Owner Executive Dashboard & Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700/80">
                  <p className="text-xs text-slate-400 uppercase">Total Factory Inspections</p>
                  <p className="text-2xl font-bold text-white mt-1">{history.length + 142}</p>
                </div>
                <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700/80">
                  <p className="text-xs text-slate-400 uppercase">Current Yield Pass Rate</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">94.8%</p>
                </div>
                <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700/80">
                  <p className="text-xs text-slate-400 uppercase">System Status</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">Milestone 1 Complete</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                👋 Welcome, Owner! You have administrative oversight. You can review all logs generated by Quality Engineers below or register new factory personnel.
              </p>
            </div>
          </div>
        )}

        {/* ROLE 2: CLIENT / BUYER VIEW */}
        {currentUser.role === 'client' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center text-emerald-400">
              <Eye className="w-5 h-5 mr-2" />
              Client Verification Portal (Read-Only)
            </h2>
            <p className="text-sm text-slate-300">
              Welcome! As a registered buyer/client, you have read-only access to verify product batches inspected by our VisionInspect AI conveyor systems.
            </p>
            <div className="border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs uppercase text-slate-400">
                  <tr><th className="p-3">Batch ID</th><th className="p-3">Product Category</th><th className="p-3">AI Integrity Check</th><th className="p-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                  <tr><td className="p-3 font-mono">#BTC-8821</td><td>MVTec Bottle</td><td>File Format & Structure Validated</td><td className="text-emerald-400 font-bold flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Passed Pre-Check</td></tr>
                  <tr><td className="p-3 font-mono">#BTC-8822</td><td>MVTec Capsule (Damaged)</td><td>Awaiting Milestone 2 Deep AI Anomaly Model</td><td className="text-amber-400 font-bold flex items-center"><Activity className="w-4 h-4 mr-1"/> Pending AI Grading</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROLE 3: QUALITY ENGINEER (OR OWNER OVERRIDE) - THE INSPECTION WORKSPACE */}
        {(currentUser.role === 'quality_engineer' || currentUser.role === 'owner') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* LEFT: UPLOAD BOX */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <UploadCloud className="w-5 h-5 mr-2 text-blue-400" />
                  Ingest Product Image ({currentUser.role.replace('_', ' ')})
                </h2>

                {!previewUrl ? (
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setResult(null); setError(null);
                      }
                    }}
                    onClick={() => document.getElementById('fileInput').click()}
                    className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-12 text-center transition-all bg-slate-900/40 cursor-pointer group"
                  >
                    <ImageIcon className="w-12 h-12 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-base font-medium text-slate-200">Click to browse or drag and drop sample</p>
                    <p className="text-sm text-slate-400 mt-1">Supports industrial MVTec AD samples (.png, .jpg)</p>
                    <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-700 aspect-video flex items-center justify-center">
                      <img src={previewUrl} alt="Inspection Sample" className="max-h-full max-w-full object-contain" />
                      <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); setResult(null); }} className="absolute top-4 right-4 bg-slate-900/80 hover:bg-red-600/80 text-white p-2 rounded-lg text-xs font-medium">Change Image</button>
                    </div>
                    <div className="flex justify-between bg-slate-900/60 px-4 py-3 rounded-lg border border-slate-700/60 text-sm">
                      <span className="text-slate-300 font-medium truncate">{selectedFile.name}</span>
                      <span className="text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleUpload} disabled={!selectedFile || loading}
                    className={`w-full py-3 px-6 rounded-xl font-medium flex items-center justify-center shadow-lg transition-all ${
                      !selectedFile || loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    }`}
                  >
                    {loading ? <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Validating File Stream...</> : <><ShieldCheck className="w-5 h-5 mr-2" /> Run Technical Pre-Check (Milestone 1)</>}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: DIAGNOSTICS */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                    Inspection Diagnostics
                  </h2>

                  {!result && !loading && (
                    <div className="border border-slate-700/60 bg-slate-900/30 rounded-xl p-8 text-center my-auto">
                      <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium text-sm">Awaiting Image Ingestion</p>
                      <p className="text-xs text-slate-500 mt-1">Upload a sample to run Milestone 1 technical validation.</p>
                    </div>
                  )}

                  {result && (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                          <div>
                            <h4 className="text-sm font-bold text-emerald-300">Milestone 1 Pre-Check Passed</h4>
                            <p className="text-xs text-emerald-400/80">File intact & stored. Ready for Milestone 2 AI Model!</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded">200 OK</span>
                      </div>

                      <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-3 font-mono text-xs">
                        <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500">Status</span><span className="text-emerald-400 font-bold">{result.status}</span></div>
                        <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500">Inspector ID</span><span className="text-blue-400 font-bold">{currentUser.username} ({currentUser.role})</span></div>
                        <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500">File Name</span><span className="text-slate-300 truncate max-w-[180px]">{result.original_filename}</span></div>
                        <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500">Dimensions</span><span className="text-slate-300">{result.dimensions}</span></div>
                        <div className="pt-1"><span className="text-slate-500 block mb-1">Server Path:</span><span className="text-slate-400 bg-slate-950 p-2 rounded block break-all text-[10px]">{result.file_path}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}