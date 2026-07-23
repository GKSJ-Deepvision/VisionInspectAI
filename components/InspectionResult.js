import HeatmapOverlay from './HeatmapOverlay';
import SeverityBadge from './SeverityBadge';

function ImageTile({ label, preview, showHeatmap, result, processed }) {
  return (
    <div className="bg-panel border border-gridline p-4 flex-1">
      <p className="text-xs font-mono text-muted uppercase mb-3">{label}</p>
      <div className="relative w-full aspect-square bg-graphite overflow-hidden">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-contain"
            style={processed ? { filter: 'grayscale(35%) contrast(1.15) brightness(0.95)' } : undefined}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted font-mono">
            No image yet
          </div>
        )}
        {showHeatmap && result && (
          <HeatmapOverlay heatmap={result.heatmap} level={result.severityLevel} />
        )}
      </div>
      {processed && (
        <p className="text-[10px] font-mono text-muted mt-2">
          Simulated preprocessing view — replace with backend-processed image once available.
        </p>
      )}
    </div>
  );
}

export default function InspectionResult({ preview, result, isLoading }) {
  return (
    <div className="bg-panel border border-gridline p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-ink">Inspection Result</h2>
        {isLoading && (
          <span className="flex items-center gap-2 text-xs font-mono text-muted uppercase">
            <span className="w-3 h-3 border-2 border-gridline border-t-signal rounded-full animate-spin" />
            Processing…
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <ImageTile label="Uploaded Image" preview={preview} />
        <ImageTile
          label="Processed Image (Defect Heatmap)"
          preview={preview}
          processed
          showHeatmap
          result={result}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-graphite border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Prediction</p>
          <p className="font-display text-lg text-ink mt-2">
            {result?.prediction || '—'}
          </p>
        </div>
        <div className="bg-graphite border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Confidence</p>
          <p className="font-display text-lg text-ink mt-2">
            {result ? `${result.confidence}%` : '—'}
          </p>
          {result && (
            <div className="w-full h-1.5 bg-gridline mt-2">
              <div
                className="h-full bg-signal"
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          )}
        </div>
        <div className="bg-graphite border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Severity</p>
          <div className="mt-2">
            {result ? (
              <SeverityBadge level={result.severityLevel} score={result.severityScore} />
            ) : (
              <span className="text-muted">—</span>
            )}
          </div>
        </div>
        <div className="bg-graphite border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">Pass / Fail</p>
          <p
            className={`font-display text-lg mt-2 ${
              !result ? 'text-muted' : result.decision === 'Reject' ? 'text-signal' : 'text-ok'
            }`}
          >
            {result ? (result.decision === 'Reject' ? '✕ Fail' : '✓ Pass') : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
