import { useEffect, useState } from 'react';
import { downloadCSV } from '../lib/csv';

// TODO: Once the factory-supervisor backend integration is confirmed (check with
// team lead which branch has it), replace this mock fetch simulation with a real
// call, e.g.:
//   const res = await fetch('/api/supervisor/overview');
//   const data = await res.json();
// and set stats/lines/escalations/trend from the response instead of the
// hardcoded values below.

const MOCK_ESCALATIONS = [
  { id: 1, product: 'Automotive Panel', defect: 'Surface Crack', severity: 88, line: 'Line 3' },
  { id: 2, product: 'PCB Board', defect: 'Missing Component', severity: 91, line: 'Line 1' },
  { id: 3, product: 'Metal Bracket', defect: 'Surface Crack', severity: 76, line: 'Line 2' },
];

const TREND = [40, 55, 48, 62, 58, 70, 65];

const LINES = [
  { name: 'Line 1', status: 'Attention', pass: 88 },
  { name: 'Line 2', status: 'Operational', pass: 95 },
  { name: 'Line 3', status: 'Attention', pass: 84 },
];

const DEFECT_DISTRIBUTION = [
  { name: 'Surface Crack', count: 34 },
  { name: 'Missing Component', count: 19 },
  { name: 'Surface Scratch', count: 41 },
  { name: 'Discoloration', count: 12 },
];

function SkeletonBlock({ className = '' }) {
  return <div className={`bg-gridline/40 animate-pulse ${className}`} />;
}

export default function SupervisorOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const maxDefect = Math.max(...DEFECT_DISTRIBUTION.map((d) => d.count));

  useEffect(() => {
    // Simulated load delay — swap for the real fetch above, keep this pattern
    // (isLoading true -> false once data arrives) either way.
    const timer = setTimeout(() => {
      setQueue(MOCK_ESCALATIONS);
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  function resolve(id) {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }

  function handleExport() {
    downloadCSV('escalation_queue.csv', queue, [
      { key: 'product', label: 'Product' },
      { key: 'line', label: 'Line' },
      { key: 'defect', label: 'Defect' },
      { key: 'severity', label: 'Severity' },
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Inspected Today', 'Pass Rate', 'Critical Defects', 'Active Lines'].map((label, i) => (
          <div key={label} className="bg-panel border border-gridline p-4">
            <p className="text-xs font-mono text-muted uppercase">{label}</p>
            {isLoading ? (
              <SkeletonBlock className="h-7 w-14 mt-2" />
            ) : (
              <p
                className={`font-display text-2xl mt-1 ${
                  i === 1 ? 'text-ok' : i === 2 ? 'text-signal' : 'text-ink'
                }`}
              >
                {i === 0 ? '312' : i === 1 ? '91.4%' : i === 2 ? queue.length : '3'}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-panel border border-gridline p-4 sm:p-6">
        <h2 className="font-display text-lg text-ink mb-4">Production Line Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LINES.map((line) => (
            <div key={line.name} className="bg-graphite border border-gridline p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink font-body">{line.name}</span>
                {isLoading ? (
                  <SkeletonBlock className="h-4 w-16" />
                ) : (
                  <span
                    className={`text-xs font-mono px-2 py-0.5 border ${
                      line.status === 'Attention' ? 'border-warn text-warn' : 'border-ok text-ok'
                    }`}
                  >
                    {line.status}
                  </span>
                )}
              </div>
              {isLoading ? (
                <SkeletonBlock className="h-1.5 w-full" />
              ) : (
                <>
                  <div className="w-full h-1.5 bg-gridline">
                    <div className="h-full bg-signal" style={{ width: `${line.pass}%` }} />
                  </div>
                  <p className="text-xs font-mono text-muted mt-1">{line.pass}% pass rate</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-panel border border-gridline p-4 sm:p-6">
          <h2 className="font-display text-lg text-ink mb-4">7-Day Pass Rate Trend</h2>
          <div className="flex items-end gap-2 sm:gap-3 h-32">
            {TREND.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                {isLoading ? (
                  <SkeletonBlock className="w-full h-full" />
                ) : (
                  <div className="w-full bg-signal/40" style={{ height: `${val}%` }} title={`${val}%`} />
                )}
                <span className="text-[10px] font-mono text-muted">D{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-panel border border-gridline p-4 sm:p-6">
          <h2 className="font-display text-lg text-ink mb-4">Plant-Wide Defect Distribution</h2>
          <div className="space-y-3">
            {DEFECT_DISTRIBUTION.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between text-xs font-mono text-muted mb-1">
                  <span>{d.name}</span>
                  <span>{d.count}</span>
                </div>
                {isLoading ? (
                  <SkeletonBlock className="h-2 w-full" />
                ) : (
                  <div className="w-full h-2 bg-graphite">
                    <div
                      className="h-full bg-signal"
                      style={{ width: `${(d.count / maxDefect) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-panel border border-gridline">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gridline">
          <h2 className="font-display text-lg text-ink">Escalation Queue</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted uppercase">
              {isLoading ? '…' : `${queue.length} pending`}
            </span>
            <button
              onClick={handleExport}
              disabled={!queue.length}
              className="text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-signal hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="px-4 sm:px-6 py-4 space-y-3">
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-14 w-full" />
          </div>
        ) : queue.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted font-body">
            No pending escalations — all clear for now.
          </div>
        ) : (
          <div>
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gridline last:border-0"
              >
                <div>
                  <p className="text-ink text-sm font-body">
                    {item.product} · <span className="text-muted">{item.line}</span>
                  </p>
                  <p className="text-xs font-mono text-signal mt-1">
                    {item.defect} — severity {item.severity}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => resolve(item.id)}
                    className="flex-1 sm:flex-none text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-ok hover:text-ok transition-colors"
                  >
                    Approve Rework
                  </button>
                  <button
                    onClick={() => resolve(item.id)}
                    className="flex-1 sm:flex-none text-xs font-mono border border-signal px-3 py-1.5 text-signal hover:bg-signal/10 transition-colors"
                  >
                    Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
