const LEVELS = {
  Critical: 'text-signal border-signal',
  High: 'text-signal border-signal/60',
  Medium: 'text-warn border-warn',
  Low: 'text-ok border-ok',
};

export default function SeverityBadge({ level, score }) {
  const classes = LEVELS[level] || 'text-muted border-muted';
  return (
    <span className={`inline-flex items-center gap-2 border px-2 py-0.5 text-xs font-mono ${classes}`}>
      {level} · {score}
    </span>
  );
}
