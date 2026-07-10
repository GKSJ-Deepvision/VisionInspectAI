import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-red-500/10 p-4 text-red-400 mb-6 border border-red-500/20">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">403 - Access Forbidden</h1>
      <p className="mt-3 max-w-md text-base text-slate-400">
        Your operator account credentials do not grant permissions for this control segment. 
        Contact security or admin if you believe this is in error.
      </p>
      <div className="mt-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
