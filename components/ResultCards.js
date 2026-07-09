import SeverityBadge from './SeverityBadge';

function Card({ label, children }) {
  return (
    <div className="bg-panel border border-gridline p-4">
      <p className="text-xs font-mono text-muted uppercase">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function ResultCards({ result }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card label="Product Category">
        <p className="font-display text-lg text-ink">
          {result?.productCategory || '—'}
        </p>
      </Card>
      <Card label="Defect Type">
        <p className="font-display text-lg text-ink">
          {result?.defectType || '—'}
        </p>
      </Card>
      <Card label="Severity Score">
        {result ? (
          <SeverityBadge level={result.severityLevel} score={result.severityScore} />
        ) : (
          <p className="font-display text-lg text-muted">—</p>
        )}
      </Card>
      <Card label="Pass / Fail Status">
        <p
          className={`font-display text-lg ${
            !result ? 'text-muted' : result.decision === 'Reject' ? 'text-signal' : 'text-ok'
          }`}
        >
          {result ? (result.decision === 'Reject' ? '✕ Fail' : '✓ Pass') : '—'}
        </p>
      </Card>
    </div>
  );
}
