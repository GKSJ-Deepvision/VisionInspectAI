const LEVEL_COLORS = {
  Critical: 'rgba(255,106,61,0.75)',
  High: 'rgba(255,106,61,0.55)',
  Medium: 'rgba(242,201,76,0.55)',
  Low: 'rgba(62,217,138,0.45)',
};

export default function HeatmapOverlay({ heatmap, level }) {
  if (!heatmap) return null;
  const color = LEVEL_COLORS[level] || 'rgba(139,147,161,0.5)';

  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${heatmap.x}%`,
        top: `${heatmap.y}%`,
        width: `${heatmap.radius * 2}px`,
        height: `${heatmap.radius * 2}px`,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
}
