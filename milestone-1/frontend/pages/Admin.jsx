import React from 'react';
import { ShieldCheck, UserCheck, Database, Server } from 'lucide-react';

const Admin = () => {
  const systemStatus = [
    { label: 'Database Status', value: 'Connected', detail: 'PostgreSQL on port 5432', icon: Database, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'ML Inference API', value: 'Online', detail: 'PyTorch/Cuda active', icon: Server, color: 'text-indigo-400 bg-indigo-500/10' }
  ];

  const operators = [
    { name: 'Admin User', email: 'admin@visioninspect.ai', role: 'admin', node: 'Primary Server' },
    { name: 'Quality Inspector A', email: 'inspector.a@visioninspect.ai', role: 'quality_engineer', node: 'Inspection Terminal 1' },
    { name: 'Production Supervisor B', email: 'supervisor.b@visioninspect.ai', role: 'factory_supervisor', node: 'Control Station' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Admin Console</h1>
        <p className="text-sm text-slate-400">Manage database connection nodes, ML service states, and operator profiles</p>
      </div>

      {/* Connection Metrics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {systemStatus.map((status, i) => {
          const Icon = status.icon;
          return (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#131A26]/40 p-6 backdrop-blur-md">
              <div className={`rounded-xl p-3 ${status.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">{status.label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{status.value}</p>
                <p className="text-xs text-slate-500 mt-1">{status.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operator Profiles */}
      <div className="rounded-xl border border-white/5 bg-[#131A26]/40 p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6">
          <UserCheck className="h-5 w-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Registered Operator Nodes</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-slate-950/20 text-slate-400">
                <th className="p-4 font-semibold">Operator Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">System Role</th>
                <th className="p-4 font-semibold">Assigned Station</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((op, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="p-4 font-semibold text-white">{op.name}</td>
                  <td className="p-4 text-slate-300 font-mono text-xs">{op.email}</td>
                  <td className="p-4">
                    <span className="inline-flex rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                      {op.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{op.node}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
