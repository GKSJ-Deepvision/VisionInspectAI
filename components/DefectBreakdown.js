export default function DefectBreakdown({ rows }) {
  const counts = rows.reduce((acc, row) => {
    acc[row.prediction] = (acc[row.prediction] || 0) + 1;
    return acc;
  }, {});
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = entries.length ? entries[0][1] : 1;

  return (
    <div className="bg-panel border border-gridline p-6">
      <h2 className="font-display text-lg text-ink mb-4">Defect Type Breakdown</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted font-body">
          No inspections logged yet — this fills in as you run inspections.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map(([name, count]) => (
            <div key={name}>
              <div className="flex items-center justify-between text-xs font-mono text-muted mb-1">
                <span>{name}</span>
                <span>{count}</span>
              </div>
              <div className="w-full h-2 bg-graphite">
                <div
                  className="h-full bg-signal"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
