import React from 'react';
import { LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#0B0F19]/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <svg className="h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
          <defs>
            <linearGradient id="logo-grad-nav" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366F1" />
              <stop offset="100%" stop-color="#06B6D4" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="20" fill="url(#logo-grad-nav)" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="#FFFFFF" stroke-width="6" />
          <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
          <path d="M 68 32 L 80 20" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
        </svg>
        <span className="text-xl font-bold tracking-tight text-white">
          VisionInspect <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">AI</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
        </button>

        {user && (
          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.full_name}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <User className="h-4 w-4" />
            </div>
            <button 
              onClick={logout} 
              className="rounded-full p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
