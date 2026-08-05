import Link from 'next/link';

export default function DashboardHeader({ title, subtitle, roleLabel, onLogout, showReportsLink }) {
  return (
    <header className="border-b border-gridline">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs tracking-[0.2em] text-muted font-mono uppercase">
            VisionInspect AI
          </span>
          <h1 className="font-display text-lg sm:text-xl text-ink">{title}</h1>
          <p className="text-xs text-muted mt-1 font-body">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-xs font-mono text-muted uppercase border border-gridline px-2 py-1">
            {roleLabel}
          </span>
          {showReportsLink && (
            <Link
              href="/reports"
              className="text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-signal hover:text-ink transition-colors"
            >
              Reports
            </Link>
          )}
          <button
            onClick={onLogout}
            className="text-xs font-mono border border-gridline px-3 py-1.5 text-muted hover:border-signal hover:text-ink transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
