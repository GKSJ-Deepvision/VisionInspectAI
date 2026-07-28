// Simple animated SVG icons representing each stage of the inspection pipeline.
// Animations are CSS-driven (see globals.css) so they replay whenever the SVG mounts.

export function PreprocessingVisual() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <rect x="30" y="30" width="180" height="180" fill="none" stroke="#242A35" strokeWidth="2" />
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`v${i}`} x1={30 + (i + 1) * 30} y1="30" x2={30 + (i + 1) * 30} y2="210" stroke="#242A35" strokeWidth="1" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`h${i}`} x1="30" y1={30 + (i + 1) * 30} x2="210" y2={30 + (i + 1) * 30} stroke="#242A35" strokeWidth="1" />
      ))}
      <rect x="30" y="30" width="180" height="6" fill="#FF6A3D" className="scan-line" />
    </svg>
  );
}

export function FeatureExtractionVisual() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <circle cx="120" cy="120" r="70" fill="none" stroke="#8B93A1" strokeWidth="1.5" strokeDasharray="6 4" />
      <polygon points="120,60 165,95 148,150 92,150 75,95" fill="none" stroke="#FF6A3D" strokeWidth="2" className="draw-in" />
      <circle cx="120" cy="60" r="4" fill="#FF6A3D" />
      <circle cx="165" cy="95" r="4" fill="#FF6A3D" />
      <circle cx="148" cy="150" r="4" fill="#FF6A3D" />
      <circle cx="92" cy="150" r="4" fill="#FF6A3D" />
      <circle cx="75" cy="95" r="4" fill="#FF6A3D" />
    </svg>
  );
}

export function DetectionVisual() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <rect x="50" y="50" width="140" height="140" rx="4" fill="none" stroke="#242A35" strokeWidth="2" />
      <rect x="95" y="90" width="55" height="45" fill="none" stroke="#FF6A3D" strokeWidth="2" className="draw-in" />
      <circle cx="122" cy="112" r="3" fill="#FF6A3D" className="pulse-dot" />
      <text x="95" y="84" fill="#FF6A3D" fontSize="11" fontFamily="monospace">defect 0.91</text>
    </svg>
  );
}

export function SeverityVisual() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <circle cx="120" cy="120" r="80" fill="none" stroke="#242A35" strokeWidth="14" />
      <circle
        cx="120" cy="120" r="80" fill="none" stroke="#FF6A3D" strokeWidth="14"
        strokeDasharray="502" strokeDashoffset="502" strokeLinecap="round"
        transform="rotate(-90 120 120)" className="gauge-fill"
      />
      <text x="120" y="128" textAnchor="middle" fill="#E8EAED" fontSize="28" fontFamily="monospace" fontWeight="600">88</text>
    </svg>
  );
}

export function DecisionVisual() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <rect x="55" y="55" width="130" height="130" fill="none" stroke="#242A35" strokeWidth="2" />
      <path
        d="M85 120 l25 25 l45 -55" fill="none" stroke="#3ED98A" strokeWidth="8"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="120" strokeDashoffset="120" className="check-draw"
      />
    </svg>
  );
}
