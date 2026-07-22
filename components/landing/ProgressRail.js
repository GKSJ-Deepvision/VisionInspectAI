import { motion, useScroll, useTransform } from 'framer-motion';

const STAGES = [
  'Upload',
  'Preprocessing',
  'Feature Extraction',
  'Defect Detection',
  'Classification',
  'Decision',
];

export default function ProgressRail({ containerRef }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div className="hidden lg:flex flex-col items-start gap-6 fixed right-10 top-1/2 -translate-y-1/2 z-30">
      {STAGES.map((label, i) => {
        const segment = 1 / STAGES.length;
        const start = i * segment;
        const end = start + segment;
        const opacity = useTransform(
          scrollYProgress,
          [Math.max(0, start - segment * 0.3), start, end, Math.min(1, end + segment * 0.3)],
          [0.25, 1, 1, 0.25]
        );
        const scale = useTransform(
          scrollYProgress,
          [Math.max(0, start - segment * 0.3), start, end, Math.min(1, end + segment * 0.3)],
          [0.8, 1, 1, 0.8]
        );

        return (
          <motion.div key={label} style={{ opacity }} className="flex items-center gap-3">
            <motion.span
              style={{ scale }}
              className="w-2 h-2 rounded-full bg-signal shrink-0"
            />
            <span className="text-[11px] font-mono uppercase tracking-wide text-ink whitespace-nowrap">
              {label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
