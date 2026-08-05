import SeverityBadge from './SeverityBadge';

function ImageTile({ label, preview, processed, isLoading }) {
  return (
    <div className="bg-panel border border-gridline p-3 sm:p-4 flex-1 min-w-0">
      <p className="text-xs font-mono text-muted uppercase mb-3 truncate">{label}</p>
      <div className="relative w-full aspect-square bg-graphite overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full animate-pulse bg-gridline/40" />
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-contain"
            style={processed ? { filter: 'grayscale(35%) contrast(1.15) brightness(0.95)' } : undefined}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted font-mono text-center px-2">
            No image yet
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, children, isLoading }) {
  return (
    <div className="bg-graphite border border-gridline p-4">
      <p className="text-xs font-mono text-muted uppercase">{label}</p>
      <div className="mt-2">
        {isLoading ? (
          <div className="h-5 w-16 bg-gridline/40 animate-pulse rounded-sm" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default function InspectionResult({ preview, result, isLoading }) {
  return (
    <div className="bg-panel border border-gridline p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-ink">Inspection Result</h2>
        {isLoading && (
          <span className="flex items-center gap-2 text-xs font-mono text-muted uppercase">
            <span className="w-3 h-3 border-2 border-gridline border-t-signal rounded-full animate-spin" />
            Processing…
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <ImageTile
          label="Original Image"
          preview={result?.originalImage || preview}
          isLoading={isLoading && !result}
        />
        <ImageTile
          label="YOLO Crop"
          preview={result?.croppedImage || preview}
          isLoading={isLoading && !result}
        />
        <ImageTile
          label="AE Reconstruction"
          preview={result?.reconstructedImage}
          isLoading={isLoading}
        />
        <ImageTile
          label="Anomaly Heatmap"
          preview={result?.heatmapImage}
          isLoading={isLoading}
        />
        <ImageTile
          label="Defect Localization"
          preview={result?.processedImage}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Prediction" isLoading={isLoading}>
          <p className="font-display text-lg text-ink truncate">{result?.prediction || '—'}</p>
        </MetricCard>
        <MetricCard label="Confidence" isLoading={isLoading}>
          <p className="font-display text-lg text-ink">
            {result ? `${result.confidence}%` : '—'}
          </p>
          {result && (
            <div className="w-full h-1.5 bg-gridline mt-2">
              <div className="h-full bg-signal" style={{ width: `${result.confidence}%` }} />
            </div>
          )}
        </MetricCard>
        <MetricCard label="Severity" isLoading={isLoading}>
          {result ? (
            <SeverityBadge level={result.severityLevel} score={result.severityScore} />
          ) : (
            <span className="text-muted">—</span>
          )}
        </MetricCard>
        <MetricCard label="Pass / Fail" isLoading={isLoading}>
          <p
            className={`font-display text-lg ${
              !result ? 'text-muted' : result.decision === 'Reject' ? 'text-signal' : 'text-ok'
            }`}
          >
            {result ? (result.decision === 'Reject' ? '✕ Fail' : '✓ Pass') : '—'}
          </p>
        </MetricCard>
      </div>
    </div>
  );
}
