import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UploadPanel from '../components/UploadPanel';
import InspectionResult from '../components/InspectionResult';
import InspectionTable from '../components/InspectionTable';
import DefectBreakdown from '../components/DefectBreakdown';
import SupervisorOverview from '../components/SupervisorOverview';
import Toast from '../components/Toast';
import { runInspection } from '../lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [rows, setRows] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [latestResult, setLatestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('vi_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setRole(localStorage.getItem('vi_role') || 'quality_engineer');
  }, [router]);

  function handleFileChange(selectedFile, previewUrl) {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setPreview(previewUrl);
    setLatestResult(null);
  }

  async function handleRun() {
    if (!file) return;
    setIsLoading(true);
    try {
      const result = await runInspection(file);
      setLatestResult(result);
      setRows((prev) => [{ fileName, ...result }, ...prev]);

      if (result.severityLevel === 'Critical') {
        setToast({
          message: `Critical defect detected — ${result.prediction} (severity ${result.severityScore})`,
          level: 'critical',
        });
      } else if (result.decision === 'Pass') {
        setToast({ message: `Inspection passed — ${result.prediction || 'no defect'}`, level: 'ok' });
      }
    } catch (err) {
      console.error('Inspection failed:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('vi_token');
    localStorage.removeItem('vi_role');
    router.push('/login');
  }

  if (!role) return null;

  const isSupervisor = role === 'factory_supervisor';

  return (
    <div className="min-h-screen bg-graphite bg-blueprint bg-grid font-body">
      <header className="border-b border-gridline">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-xs tracking-[0.2em] text-muted font-mono uppercase">
              VisionInspect AI
            </span>
            <h1 className="font-display text-xl text-ink">
              {isSupervisor ? 'Production Overview' : 'Inspection Console'}
            </h1>
            <p className="text-xs text-muted mt-1 font-body">
              {isSupervisor
                ? 'Plant-wide quality monitoring and escalation review'
                : 'Run and log defect inspections on incoming product images'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted uppercase border border-gridline px-2 py-1">
              {isSupervisor ? 'Factory Supervisor' : 'Quality Engineer'}
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
        {isSupervisor ? (
          <SupervisorOverview />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-panel border border-gridline p-4">
                <p className="text-xs font-mono text-muted uppercase">Inspections Run</p>
                <p className="font-display text-2xl text-ink mt-1">{rows.length}</p>
              </div>
              <div className="bg-panel border border-gridline p-4">
                <p className="text-xs font-mono text-muted uppercase">Passed</p>
                <p className="font-display text-2xl text-ok mt-1">
                  {rows.filter((r) => r.decision === 'Pass').length}
                </p>
              </div>
              <div className="bg-panel border border-gridline p-4">
                <p className="text-xs font-mono text-muted uppercase">Rejected</p>
                <p className="font-display text-2xl text-signal mt-1">
                  {rows.filter((r) => r.decision === 'Reject').length}
                </p>
              </div>
            </div>

            <UploadPanel
              onFileChange={handleFileChange}
              onRun={handleRun}
              isLoading={isLoading}
              hasFile={!!file}
            />

            <InspectionResult preview={preview} result={latestResult} isLoading={isLoading} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <InspectionTable rows={rows} />
              </div>
              <DefectBreakdown rows={rows} />
            </div>
          </>
        )}
      </main>

      {toast && <Toast message={toast.message} level={toast.level} onDismiss={() => setToast(null)} />}
    </div>
  );
}
