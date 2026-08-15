import { useMemo, useState } from 'react';
import SeverityBadge from './SeverityBadge';
import { downloadCSV } from '../lib/csv';
import { downloadInspectionHistoryPdf } from '../lib/api';

export default function InspectionTable({ rows }) {
  const [query, setQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('all');

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesQuery =
  !query ||
  (row.productCategory || '')
    .toLowerCase()
    .includes(query.toLowerCase()) ||
  (row.prediction || '')
    .toLowerCase()
    .includes(query.toLowerCase());
      const matchesDecision = decisionFilter === 'all' || row.decision === decisionFilter;
      return matchesQuery && matchesDecision;
    });
  }, [rows, query, decisionFilter]);

  function handleExport() {
    downloadCSV('inspection_log.csv', filtered, [
      { key: 'fileName', label: 'File Name' },
      { key: 'productCategory', label: 'Product Category' },
      { key: 'prediction', label: 'Prediction' },
      { key: 'confidence', label: 'Confidence' },
      { key: 'severityScore', label: 'Severity Score' },
      { key: 'severityLevel', label: 'Severity Level' },
      { key: 'decision', label: 'Decision' },
    ]);
  }

  async function handlePdfDownload() {
  try {
    await downloadInspectionHistoryPdf();
  } catch (error) {
    console.error('Failed to download PDF:', error);
  }
}

  return (
    <div className="bg-panel border border-gridline">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-6 py-4 border-b border-gridline">
        <h2 className="font-display text-lg text-ink">Inspection Log</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search category or defect…"
            className="bg-graphite border border-gridline px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-signal"
          />
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="bg-graphite border border-gridline px-2 py-1.5 text-xs text-muted focus:outline-none focus:border-signal"
          >
            <option value="all">All</option>
            <option value="Pass">Pass</option>
            <option value="Reject">Reject</option>
          </select>
          <button
            onClick={handleExport}
            disabled={!filtered.length}
            className="text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-signal hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          <button
  onClick={handlePdfDownload}
  disabled={!rows.length}
  className="text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-signal hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
>
  Download PDF
</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-muted font-body">
          {rows.length === 0
            ? 'No inspections run yet. Upload a product image to generate the first record.'
            : 'No records match your search/filter.'}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-mono uppercase text-muted border-b border-gridline">
              <th className="px-6 py-3 font-normal">Product Image</th>
              <th className="px-6 py-3 font-normal">Category</th>
              <th className="px-6 py-3 font-normal">Prediction</th>
              <th className="px-6 py-3 font-normal">Confidence</th>
              <th className="px-6 py-3 font-normal">Severity</th>
              <th className="px-6 py-3 font-normal">Decision</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="border-b border-gridline last:border-0">
                <td className="px-6 py-3 font-mono text-ink truncate max-w-[160px]">
                  {row.fileName}
                </td>
                <td className="px-6 py-3 text-muted">{row.productCategory}</td>
                <td className="px-6 py-3 text-ink">{row.prediction}</td>
                <td className="px-6 py-3 text-muted font-mono">{row.confidence}%</td>
                <td className="px-6 py-3">
                  <SeverityBadge level={row.severityLevel} score={row.severityScore} />
                </td>
                <td className="px-6 py-3">
                  <span
                    className={
                      row.decision === 'Reject' ? 'text-signal font-mono' : 'text-ok font-mono'
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
