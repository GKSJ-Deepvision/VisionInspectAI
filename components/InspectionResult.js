import SeverityBadge from './SeverityBadge';

function ImageTile({ label, preview, processed }) {
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
            style={
              processed
                ? {
                    filter:
                      'grayscale(35%) contrast(1.15) brightness(0.95)',
                  }
                : undefined
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted font-mono">
            No image yet
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-graphite border border-gridline p-4">
      <p className="text-xs font-mono text-muted uppercase">{label}</p>
      <p className="font-display text-lg text-ink mt-2">
        {value ?? '—'}
      </p>
    </div>
  );
}

export default function InspectionResult({ preview, result, isLoading }) {
  return (
    <div className="bg-panel border border-gridline p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-ink">
          Inspection Result
        </h2>

        {isLoading && (
          <span className="flex items-center gap-2 text-xs font-mono text-muted uppercase">
            <span className="w-3 h-3 border-2 border-gridline border-t-signal rounded-full animate-spin" />
            Processing…
          </span>
        )}
      </div>

      {/* IMAGE PIPELINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <ImageTile
          label="Original Image"
          preview={result?.originalImage || preview}
        />

        <ImageTile
          label="YOLO Crop"
          preview={result?.croppedImage || preview}
        />

        <ImageTile
          label="AE Reconstruction"
          preview={result?.reconstructedImage}
        />

        <ImageTile
          label="Anomaly Heatmap"
          preview={result?.heatmapImage}
        />

        <ImageTile
          label="Defect Localization"
          preview={result?.processedImage}
        />
      </div>

      {/* PRIMARY RESULT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <MetricCard
          label="Prediction"
          value={result?.prediction}
        />

        <div className="bg-graphite border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">
            Confidence
          </p>

          <p className="font-display text-lg text-ink mt-2">
            {result ? `${result.confidence}%` : '—'}
          </p>

          {result && (
            <div className="w-full h-1.5 bg-gridline mt-2">
              <div
                className="h-full bg-signal"
                style={{
                  width: `${Math.min(result.confidence, 100)}%`,
                }}
              />
            </div>
          )}
        </div>

        <div className="bg-graphite border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">
            Severity
          </p>

          <div className="mt-2">
            {result ? (
              <SeverityBadge
                level={result.severityLevel}
                score={result.severityScore}
              />
            ) : (
              <span className="text-muted">—</span>
            )}
          </div>
        </div>

        <div className="bg-graphite border border-gridline p-4">
          <p className="text-xs font-mono text-muted uppercase">
            Pass / Fail
          </p>

          <p
            className={`font-display text-lg mt-2 ${
              !result
                ? 'text-muted'
                : result.decision === 'Reject'
                  ? 'text-signal'
                  : 'text-ok'
            }`}
          >
            {result
              ? result.decision === 'Reject'
                ? '✕ Fail'
                : '✓ Pass'
              : '—'}
          </p>
        </div>
      </div>

      {result && (
        <>
          {/* INFERENCE DETAILS */}
          <div className="mt-4">
            <p className="text-xs font-mono text-muted uppercase mb-3">
              Inference Details
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <MetricCard
                label="Anomaly"
                value={result.isAnomaly ? 'Detected' : 'Normal'}
              />

              <MetricCard
                label="Anomaly Score"
                value={result.anomalyScore}
              />

              <MetricCard
                label="Threshold"
                value={result.threshold}
              />

              <MetricCard
                label="Processing Time"
                value={
                  result.processingTime != null
                    ? `${Number(result.processingTime).toFixed(2)} ms`
                    : '—'
                }
              />
            </div>
          </div>

          {result.normalizedScore != null && (
            <div className="mt-4">
              <MetricCard
                label="Normalized Score"
                value={Number(result.normalizedScore).toFixed(2)}
              />
            </div>
          )}

          {/* YOLO */}
          <div className="mt-4">
            <p className="text-xs font-mono text-muted uppercase mb-3">
              Object Detection
            </p>

            <div className="bg-graphite border border-gridline p-4">
              <p className="text-xs font-mono text-muted uppercase">
                YOLO Status
              </p>

              <p className="text-sm text-ink mt-2">
                {result.yoloStatus || '—'}
              </p>

              {result.bbox && (
                <p className="text-xs text-muted font-mono mt-2">
                  Bounding Box: [{result.bbox.join(', ')}]
                </p>
              )}
            </div>
          </div>

          {/* CLASS PROBABILITIES */}
          {result.classProbabilities &&
            Object.keys(result.classProbabilities).length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-mono text-muted uppercase mb-3">
                  Class Probabilities
                </p>

                <div className="bg-graphite border border-gridline p-4 space-y-3">
                  {Object.entries(result.classProbabilities).map(
                    ([className, probability]) => (
                      <div key={className}>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-ink">{className}</span>
                          <span className="text-muted">
                            {Number(probability).toFixed(2)}%
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-gridline">
                          <div
                            className="h-full bg-signal"
                            style={{
                              width: `${Math.min(
                                Number(probability),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* SEVERITY BREAKDOWN */}
          {result.severityBreakdown &&
            Object.keys(result.severityBreakdown).length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-mono text-muted uppercase mb-3">
                  Severity Breakdown
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result.severityBreakdown).map(
                    ([key, value]) => (
                      <MetricCard
                        key={key}
                        label={key.replaceAll('_', ' ')}
                        value={Number(value).toFixed(2)}
                      />
                    )
                  )}
                </div>
              </div>
            )}

          {/* QUALITY REPORT */}
          {result.qualityReport && (
            <div className="mt-4">
              <p className="text-xs font-mono text-muted uppercase mb-3">
                Image Quality Report
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Blur Score"
                  value={
                    result.qualityReport.blur_score ??
                    result.qualityReport.blurScore ??
                    '—'
                  }
                />

                <MetricCard
                  label="Brightness"
                  value={result.qualityReport.brightness ?? '—'}
                />

                <MetricCard
                  label="Contrast"
                  value={result.qualityReport.contrast ?? '—'}
                />

                <MetricCard
                  label="Valid Image"
                  value={
                    (result.qualityReport.is_valid ??
                      result.qualityReport.isValid)
                      ? 'Yes'
                      : 'No'
                  }
                />
              </div>

              {result.qualityReport.warnings?.length > 0 && (
                <div className="mt-3 bg-graphite border border-gridline p-4">
                  <p className="text-xs font-mono text-muted uppercase mb-2">
                    Warnings
                  </p>

                  <ul className="space-y-1">
                    {result.qualityReport.warnings.map(
                      (warning, index) => (
                        <li
                          key={index}
                          className="text-xs text-signal"
                        >
                          • {warning}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* RECOMMENDED ACTION */}
          {result.recommendedAction && (
            <div className="mt-4">
              <p className="text-xs font-mono text-muted uppercase mb-3">
                Recommended Action
              </p>

              <div className="bg-graphite border border-gridline p-4">
                <p className="text-sm text-ink">
                  {result.recommendedAction}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}