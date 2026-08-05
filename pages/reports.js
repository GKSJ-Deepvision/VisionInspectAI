import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SeverityBadge from '../components/SeverityBadge';
import { downloadCSV } from '../lib/csv';
import { loadInspections } from '../lib/inspectionStore';

export default function Reports() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('vi_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setRows(loadInspections());
    setReady(true);
  }, [router]);

  const summary = useMemo(() => {
    const total = rows.length;
    const passed = rows.filter((r) => r.decision === 'Pass').length;
    const rejected = total - passed;
    const bySeverity = ['Critical', 'High', 'Medium', 'Low'].map((level) => ({
      level,
      count: rows.filter((r) => r.severityLevel === level).length,
    }));
    const avgConfidence = total
      ? Math.round(rows.reduce((sum, r) => sum + (r.confidence || 0), 0) / total)
      : 0;
    return { total, passed, rejected, bySeverity, avgConfidence };
  }, [rows]);

  function handleExportAll() {
    downloadCSV('inspection_report.csv', rows, [
      { key: 'fileName', label: 'File Name' },
      { key: 'productCategory', label: 'Product Category' },
      { key: 'prediction', label: 'Prediction' },
      { key: 'confidence', label: 'Confidence' },
      { key: 'severityScore', label: 'Severity Score' },
      { key: 'severityLevel', label: 'Severity Level' },
      { key: 'decision', label: 'Decision' },
    ]);
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-graphite bg-blueprint bg-grid font-body print:bg-white">
      <header className="border-b border-gridline print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs tracking-[0.2em] text-muted font-mono uppercase">
              VisionInspect AI
            </span>
            <h1 className="font-display text-lg sm:text-xl text-ink">Inspection Report</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-signal hover:text-ink transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <button
              onClick={() => window.print()}
              className="text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-signal hover:text-ink transition-colors"
            >
              Print Report
            </button>
            <button
              onClick={handleExportAll}
              disabled={!rows.length}
              className="text-xs font-mono bg-signal text-graphite px-3 py-1.5 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-signal/90 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 print:text-black">
        <div className="hidden print:block mb-4">
          <h1 className="text-2xl font-bold">VisionInspect AI — Inspection Report</h1>
          <p className="text-sm text-gray-600">Generated {new Date().toLocaleString()}</p>
        </div>

        {rows.length === 0 ? (
          <div className="bg-panel border border-gridline p-10 text-center text-sm text-muted print:border-gray-300">
            No inspections recorded yet. Run some inspections from the dashboard, then come back here for a summary report.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-panel border border-gridline p-4 print:border-gray-300">
                <p className="text-xs font-mono text-muted uppercase print:text-gray-500">Total Inspected</p>
                <p className="font-display text-2xl text-ink mt-1 print:text-black">{summary.total}</p>
              </div>
              <div className="bg-panel border border-gridline p-4 print:border-gray-300">
                <p className="text-xs font-mono text-muted uppercase print:text-gray-500">Passed</p>
                <p className="font-display text-2xl text-ok mt-1 print:text-black">{summary.passed}</p>
              </div>
              <div className="bg-panel border border-gridline p-4 print:border-gray-300">
                <p className="text-xs font-mono text-muted uppercase print:text-gray-500">Rejected</p>
                <p className="font-display text-2xl text-signal mt-1 print:text-black">{summary.rejected}</p>
              </div>
              <div className="bg-panel border border-gridline p-4 print:border-gray-300">
                <p className="text-xs font-mono text-muted uppercase print:text-gray-500">Avg. Confidence</p>
                <p className="font-display text-2xl text-ink mt-1 print:text-black">{summary.avgConfidence}%</p>
              </div>
            </div>

            <div className="bg-panel border border-gridline p-4 sm:p-6 print:border-gray-300">
              <h2 className="font-display text-lg text-ink mb-4 print:text-black">Severity Breakdown</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {summary.bySeverity.map((s) => (
                  <div key={s.level} className="text-center">
                    <SeverityBadge level={s.level} score={s.count} />
                    <p className="text-xs text-muted mt-2 print:text-gray-600">{s.level}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-panel border border-gridline print:border-gray-300">
              <div className="px-4 sm:px-6 py-4 border-b border-gridline print:border-gray-300">
                <h2 className="font-display text-lg text-ink print:text-black">Full Inspection Record</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px] print:text-black">
                  <thead>
                    <tr className="text-left text-xs font-mono uppercase text-muted border-b border-gridline print:text-gray-600 print:border-gray-300">
                      <th className="px-4 sm:px-6 py-3 font-normal">File</th>
                      <th className="px-4 sm:px-6 py-3 font-normal">Category</th>
                      <th className="px-4 sm:px-6 py-3 font-normal">Prediction</th>
                      <th className="px-4 sm:px-6 py-3 font-normal">Confidence</th>
                      <th className="px-4 sm:px-6 py-3 font-normal">Severity</th>
                      <th className="px-4 sm:px-6 py-3 font-normal">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-b border-gridline last:border-0 print:border-gray-200">
                        <td className="px-4 sm:px-6 py-3 font-mono text-ink truncate max-w-[160px] print:text-black">
                          {row.fileName}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-muted print:text-gray-700">{row.productCategory}</td>
                        <td className="px-4 sm:px-6 py-3 text-ink print:text-black">{row.prediction}</td>
                        <td className="px-4 sm:px-6 py-3 text-muted font-mono print:text-gray-700">
                          {row.confidence}%
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <SeverityBadge level={row.severityLevel} score={row.severityScore} />
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span
                            className={
                              row.decision === 'Reject'
                                ? 'text-signal font-mono print:text-black'
                                : 'text-ok font-mono print:text-black'
                            }
                          >
                            {row.decision === 'Reject' ? '✕ Reject' : '✓ Pass'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
