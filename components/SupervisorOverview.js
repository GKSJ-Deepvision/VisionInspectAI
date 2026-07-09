import { useState } from 'react';

const MOCK_ESCALATIONS = [
  { id: 1, product: 'Automotive Panel', defect: 'Surface Crack', severity: 88, line: 'Line 3' },
  { id: 2, product: 'PCB Board', defect: 'Missing Component', severity: 91, line: 'Line 1' },
  { id: 3, product: 'Metal Bracket', defect: 'Surface Crack', severity: 76, line: 'Line 2' },
];

const TREND = [40, 55, 48, 62, 58, 70, 65]; // last 7 days, mock pass-rate-ish values

export default function SupervisorOverview() {
  const [queue, setQueue] = useState(MOCK_ESCALATIONS);

  function resolve(id) {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-panel border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Inspected Today</p>
          <p className="font-display text-2xl text-ink mt-1">312</p>
        </div>
        <div className="bg-panel border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Pass Rate</p>
          <p className="font-display text-2xl text-ok mt-1">91.4%</p>
        </div>
        <div className="bg-panel border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Critical Defects</p>
          <p className="font-display text-2xl text-signal mt-1">{queue.length}</p>
        </div>
        <div className="bg-panel border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Active Lines</p>
          <p className="font-display text-2xl text-ink mt-1">3</p>
        </div>
      </div>

      <div className="bg-panel border border-gridline p-6">
        <h2 className="font-display text-lg text-ink mb-4">
          7-Day Pass Rate Trend
        </h2>
        <div className="flex items-end gap-3 h-32">
          {TREND.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-signal/40"
                style={{ height: `${val}%` }}
                title={`${val}%`}
              />
              <span className="text-[10px] font-mono text-muted">D{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-panel border border-gridline">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gridline">
          <h2 className="font-display text-lg text-ink">Escalation Queue</h2>
          <span className="text-xs font-mono text-muted uppercase">
            {queue.length} pending
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted font-body">
            No pending escalations — all clear for now.
          </div>
        ) : (
          <div>
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-4 border-b border-gridline last:border-0"
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
                    className="text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-ok hover:text-ok transition-colors"
                  >
                    Approve Rework
                  </button>
                  <button
                    onClick={() => resolve(item.id)}
                    className="text-xs font-mono border border-signal px-3 py-1.5 text-signal hover:bg-signal/10 transition-colors"
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
