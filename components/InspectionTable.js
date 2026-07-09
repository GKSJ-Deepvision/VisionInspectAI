import SeverityBadge from './SeverityBadge';

export default function InspectionTable({ rows }) {
  return (
    <div className="bg-panel border border-gridline">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gridline">
        <h2 className="font-display text-lg text-ink">Inspection Log</h2>
        <span className="text-xs font-mono text-muted uppercase">
          {rows.length} record{rows.length !== 1 ? 's' : ''}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-muted font-body">
          No inspections run yet. Upload a product image to generate the first record.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-mono uppercase text-muted border-b border-gridline">
              <th className="px-6 py-3 font-normal">Product Image</th>
              <th className="px-6 py-3 font-normal">Category</th>
              <th className="px-6 py-3 font-normal">Defect Type</th>
              <th className="px-6 py-3 font-normal">Severity</th>
              <th className="px-6 py-3 font-normal">Decision</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gridline last:border-0">
                <td className="px-6 py-3 font-mono text-ink truncate max-w-[180px]">
                  {row.fileName}
                </td>
                <td className="px-6 py-3 text-muted">{row.productCategory}</td>
                <td className="px-6 py-3 text-ink">{row.defectType}</td>
                <td className="px-6 py-3">
                  <SeverityBadge level={row.severityLevel} score={row.severityScore} />
                </td>
                <td className="px-6 py-3">
                  <span
                    className={
                      row.decision === 'Reject'
                        ? 'text-signal font-mono'
                        : 'text-ok font-mono'
                    }
                  >
                    {row.decision === 'Reject' ? '✕ Reject' : '✓ Pass'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
