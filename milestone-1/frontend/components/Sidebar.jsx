import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  ClipboardList,
  Shield,
  AlertTriangle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Sidebar = () => {

  const { user } = useAuth();

  if (!user) return null;

  const navItems = [

    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin","factory_supervisor"]
    },

    {
      to: "/upload",
      label: "Upload Images",
      icon: UploadCloud,
      roles: ["admin","quality_engineer"]
    },

    {
      to: "/reports",
      label: "Quality Reports",
      icon: ClipboardList,
      roles: ["admin","factory_supervisor"]
    },

    {
      to: "/admin",
      label: "Admin Control",
      icon: Shield,
      roles: ["admin"]
    }

  ];

  return (

    <aside className="w-64 border-r border-white/5 bg-[#131A26]/40 min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6">

      <div className="px-4">

        <p className="px-3 text-xs uppercase font-semibold tracking-wider text-slate-400">
          Navigation
        </p>

        <nav className="mt-4 space-y-1">

          {navItems
            .filter(item => item.roles.includes(user.role))
            .map(item => {

              const Icon = item.icon;

              return (

                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({isActive}) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border-l-2 border-indigo-500 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >

                  <Icon className="h-5 w-5"/>

                  {item.label}

                </NavLink>

              );

            })}

        </nav>

      </div>

      <div className="px-4">

        <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4">

          <div className="flex items-center gap-2 text-amber-400">

            <AlertTriangle className="h-4 w-4"/>

            <span className="text-xs uppercase font-semibold">
              Operator Node
            </span>

          </div>

          <p className="mt-2 text-xs text-slate-400">

            Connected to local inspection engine.
            <br />
            Backend online.
            <br />
            Ready for image analysis.

          </p>

        </div>

      </div>

    </aside>

  );

};

export default Sidebar;
