import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UploadPanel from '../components/UploadPanel';
import InspectionResult from '../components/InspectionResult';
import InspectionTable from '../components/InspectionTable';
import DefectBreakdown from '../components/DefectBreakdown';
import SupervisorOverview from '../components/SupervisorOverview';
import Toast from '../components/Toast';
import DashboardHeader from '../components/DashboardHeader';
import {
  runInspection,
  getInspectionHistory,
  getAnalytics,
} from '../lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [rows, setRows] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('bottle');
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

  useEffect(() => {
    if (!role) return;
    loadDashboardData();
  }, [role]);

  async function loadDashboardData() {
    try {
      const [history, analyticsData] = await Promise.all([
        getInspectionHistory(),
        getAnalytics(),
      ]);

      setRows(
        history.map((item) => ({
          inspectionId: item.id,
          fileName: item.image_name,
          productCategory: item.category,
          prediction: item.defect,
          confidence: (() => {
            const value = Number(item.confidence ?? 0);
            return Math.round(value <= 1 ? value * 100 : value);
          })(),
          severityScore: item.severity_score,
          severityLevel: item.severity_level,
          decision: item.result === 'PASS' ? 'Pass' : 'Reject',
          anomalyScore: item.anomaly_score,
          threshold: item.threshold,
          recommendedAction: item.recommended_action,
          classProbabilities: item.class_probabilities,
          severityBreakdown: item.severity_breakdown,
          qualityReport: item.quality_report,
          processingTime: item.processing_time_ms,
        }))
      );

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

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
      const result = await runInspection(file, selectedCategory);
      setLatestResult(result);

      // Refresh both history and analytics after inspection
      await loadDashboardData();

      if (result.severityLevel === 'Critical') {
        setToast({
          message: `Critical defect detected — ${result.prediction} (severity ${result.severityScore})`,
          level: 'critical',
        });
      } else if (result.decision === 'Pass') {
        setToast({
          message: `Inspection passed — ${result.prediction || 'no defect'}`,
          level: 'ok',
        });
      }
    } catch (err) {
      console.error('Inspection failed:', err);
      setToast({ message: 'Inspection failed — check backend connection.', level: 'critical' });
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
      <DashboardHeader
        title={isSupervisor ? 'Production Overview' : 'Inspection Console'}
        subtitle={
          isSupervisor
            ? 'Plant-wide quality monitoring and escalation review'
            : 'Run and log defect inspections on incoming product images'
        }
        roleLabel={isSupervisor ? 'Factory Supervisor' : 'Quality Engineer'}
        onLogout={handleLogout}
        showReportsLink={!isSupervisor}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {isSupervisor ? (
          <SupervisorOverview />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-panel border border-gridline p-3 sm:p-4">
                <p className="text-xs font-mono text-muted uppercase">Inspections Run</p>
                <p className="font-display text-xl sm:text-2xl text-ink mt-1">
                  {analytics?.total_images ?? 0}
                </p>
              </div>
              <div className="bg-panel border border-gridline p-3 sm:p-4">
                <p className="text-xs font-mono text-muted uppercase">Passed</p>
                <p className="font-display text-xl sm:text-2xl text-ok mt-1">
                  {analytics?.normal_count ?? 0}
                </p>
              </div>
              <div className="bg-panel border border-gridline p-3 sm:p-4">
                <p className="text-xs font-mono text-muted uppercase">Rejected</p>
                <p className="font-display text-xl sm:text-2xl text-signal mt-1">
                  {analytics?.defect_count ?? 0}
                </p>
              </div>
            </div>

            <UploadPanel
              onFileChange={handleFileChange}
              onRun={handleRun}
              onCategoryChange={setSelectedCategory}
              selectedCategory={selectedCategory}
              isLoading={isLoading}
              hasFile={!!file}
            />

            <InspectionResult preview={preview} result={latestResult} isLoading={isLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
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
