import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UploadPanel from '../components/UploadPanel';
import InspectionTable from '../components/InspectionTable';

const DEFECT_TYPES = [
  { name: 'Surface Scratch', typeScore: 30 },
  { name: 'Surface Crack', typeScore: 95 },
  { name: 'Missing Component', typeScore: 90 },
  { name: 'Discoloration', typeScore: 20 },
];

function levelFromScore(score) {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

// Mirrors the Overall Severity Formula from the project spec:
// Severity = (Size x 30%) + (Location x 25%) + (Defect Type x 25%) + (Confidence x 20%)
// This is a frontend-side placeholder until the detection API is available.
function runMockInspection() {
  const defect = DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)];
  const size = Math.floor(Math.random() * 100);
  const location = Math.floor(Math.random() * 100);
  const confidence = 70 + Math.floor(Math.random() * 30);

  const score = Math.round(
    size * 0.3 + location * 0.25 + defect.typeScore * 0.25 + confidence * 0.2
  );
  const level = levelFromScore(score);

  return {
    defectType: defect.name,
    severityScore: score,
    severityLevel: level,
    decision: level === 'Critical' || level === 'High' ? 'Reject' : 'Pass',
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('vi_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setRole(localStorage.getItem('vi_role') || '');
  }, [router]);

  function handleInspect(fileName) {
    const result = runMockInspection();
    setRows((prev) => [{ fileName, ...result }, ...prev]);
  }

  function handleLogout() {
    localStorage.removeItem('vi_token');
    localStorage.removeItem('vi_role');
    router.push('/login');
  }

  const passCount = rows.filter((r) => r.decision === 'Pass').length;
  const rejectCount = rows.filter((r) => r.decision === 'Reject').length;

  return (
    <div className="min-h-screen bg-graphite bg-blueprint bg-grid font-body">
      <header className="border-b border-gridline">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-xs tracking-[0.2em] text-muted font-mono uppercase">
              VisionInspect AI
            </span>
            <h1 className="font-display text-xl text-ink">Inspection Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted uppercase">
              {role === 'factory_supervisor' ? 'Factory Supervisor' : 'Quality Engineer'}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-signal hover:text-ink transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-panel border border-gridline p-4">
            <p className="text-xs font-mono text-muted uppercase">Inspections Run</p>
            <p className="font-display text-2xl text-ink mt-1">{rows.length}</p>
          </div>
          <div className="bg-panel border border-gridline p-4">
            <p className="text-xs font-mono text-muted uppercase">Passed</p>
            <p className="font-display text-2xl text-ok mt-1">{passCount}</p>
          </div>
          <div className="bg-panel border border-gridline p-4">
            <p className="text-xs font-mono text-muted uppercase">Rejected</p>
            <p className="font-display text-2xl text-signal mt-1">{rejectCount}</p>
          </div>
        </div>

        <UploadPanel onInspect={handleInspect} />
        <InspectionTable rows={rows} />
      </main>
    </div>
  );
}
