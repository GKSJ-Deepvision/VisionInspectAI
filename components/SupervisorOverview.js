import { useEffect, useState } from 'react';
import { downloadCSV } from '../lib/csv';


export default function SupervisorOverview() {
  const [queue, setQueue] = useState([]);
const [trend, setTrend] = useState([]);
const [defects, setDefects] = useState([]);
const [production, setProduction] = useState(null);
const [risk, setRisk] = useState({});

useEffect(() => {
  async function loadData() {
    try {
      const BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const [
        productionRes,
        trendRes,
        riskRes,
        historyRes
      ] = await Promise.all([
        fetch(`${BASE}/reports/production`),
        fetch(`${BASE}/analytics/trends`),
        fetch(`${BASE}/analytics/risk-assessment`),
        fetch(`${BASE}/history`)
      ]);

      const productionData = await productionRes.json();
      const trendData = await trendRes.json();
      const riskData = await riskRes.json();
      const historyData = await historyRes.json();

      setProduction(productionData);
      setRisk(riskData);

      // Trend chart
      setTrend(
        trendData.time_series.map((x) => ({
          score: x.severity_score
        }))
      );

      // Defect distribution
      const severity = productionData.severity_distribution || {};

      setDefects(
        Object.entries(severity).map(([name, count]) => ({
          name,
          count
        }))
      );

      // Escalation Queue
      const critical = historyData.filter(
        (item) =>
          item.severity_level === "Critical" ||
          item.severity_level === "High"
      );

      setQueue(
        critical.map((item, index) => ({
          id: index,
          product: item.category,
          defect: item.inferred_defect_type,
          severity: item.severity_score,
          line: "Production Line"
        }))
      );

    } catch (err) {
      console.error(err);
    }
  }

  loadData();
}, []);

const maxDefect =
  defects.length > 0
    ? Math.max(...defects.map((d) => d.count))
    : 1;

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
        <div className="bg-panel border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Inspected Today</p>
          <p className="font-display text-2xl text-ink mt-1">{production?.total_units_inspected ?? 0}</p>
        </div>
        <div className="bg-panel border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Pass Rate</p>
          <p className="font-display text-2xl text-ok mt-1">{production?.yield_pass_rate_pct ?? 0}%</p>
        </div>
        <div className="bg-panel border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Critical Defects</p>
          <p className="font-display text-2xl text-signal mt-1">{queue.length}</p>
        </div>
        <div className="bg-panel border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Active Lines</p>
          <p className="font-display text-2xl text-ink mt-1">{Object.keys(risk.category_risk_levels || {}).length}</p>
        </div>
      </div>

      <div className="bg-panel border border-gridline p-6">
        <h2 className="font-display text-lg text-ink mb-4">Production Line Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(risk.category_risk_levels || {}).map(([name, line]) => (
  <div key={name} className="bg-graphite border border-gridline p-4">

    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-ink">{name}</span>

      <span
        className={`text-xs font-mono px-2 py-1 border ${
          line.risk_level === "HIGH RISK"
            ? "border-signal text-signal"
            : line.risk_level === "MEDIUM RISK"
            ? "border-warn text-warn"
            : "border-ok text-ok"
        }`}
      >
        {line.risk_level}
      </span>
    </div>

    <div className="w-full h-2 bg-gridline">
      <div
        className="h-full bg-signal"
        style={{
          width: `${100 - line.defect_rate_pct}%`,
        }}
      />
    </div>

    <p className="text-xs font-mono text-muted mt-2">
      {100 - line.defect_rate_pct}% pass rate
    </p>

  </div>
))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-panel border border-gridline p-6">
          <h2 className="font-display text-lg text-ink mb-4">7-Day Pass Rate Trend</h2>
          <div className="flex items-end gap-3 h-32">
            {trend.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-signal/40" style={{ height:`${Math.max(val.score * 100, 5)}%` }} title={`${val.score}%`} />
                <span className="text-[10px] font-mono text-muted">D{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-panel border border-gridline p-6">
          <h2 className="font-display text-lg text-ink mb-4">Plant-Wide Defect Distribution</h2>
          <div className="space-y-3">
            {defects.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between text-xs font-mono text-muted mb-1">
                  <span>{d.name}</span>
                  <span>{d.count}</span>
                </div>
                <div className="w-full h-2 bg-graphite">
                  <div className="h-full bg-signal" style={{ width: `${(d.count / maxDefect) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-panel border border-gridline">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gridline">
          <h2 className="font-display text-lg text-ink">Escalation Queue</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted uppercase">{queue.length} pending</span>
            <button
              onClick={handleExport}
              disabled={!queue.length}
              className="text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-signal hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
          </div>
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
