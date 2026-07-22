import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import ScrollReveal from '../components/ScrollReveal';
import {
  PreprocessingVisual,
  FeatureExtractionVisual,
  DetectionVisual,
  SeverityVisual,
  DecisionVisual,
} from '../components/StageVisuals';

const STAGES = [
  {
    label: 'Stage 01',
    title: 'Image Preprocessing',
    description:
      'Every incoming product image is validated, resized, and normalized. Noise is reduced and contrast enhanced, so the network sees a consistent, clean signal regardless of camera or lighting conditions.',
    tags: ['Validation', 'Resize & Normalize', 'Noise Reduction', 'Contrast Enhancement'],
    Visual: PreprocessingVisual,
  },
  {
    label: 'Stage 02',
    title: 'Feature Extraction',
    description:
      'The system studies texture, edges, shape, and pattern — building a deep feature map of the product surface that later stages use to spot anything that deviates from a healthy part.',
    tags: ['Texture Analysis', 'Edge Detection', 'Shape Analysis', 'Pattern Recognition'],
    Visual: FeatureExtractionVisual,
  },
  {
    label: 'Stage 03',
    title: 'Defect Detection',
    description:
      'Anomaly detection and object localization pinpoint exactly where a defect sits on the product, generating a bounding region and a heatmap of the affected area.',
    tags: ['Anomaly Detection', 'Object Detection', 'Segmentation', 'Heatmap Generation'],
    Visual: DetectionVisual,
  },
  {
    label: 'Stage 04',
    title: 'Classification & Severity',
    description:
      'Each defect is classified by type and scored for severity — weighing size, location, defect category, and detection confidence into a single, actionable number.',
    tags: ['Defect Type', 'Severity Scoring', 'Confidence Score', 'Root Cause Mapping'],
    Visual: SeverityVisual,
  },
  {
    label: 'Stage 05',
    title: 'Quality Decision',
    description:
      'The platform issues a clear pass or reject decision, with rework recommendations and escalation workflows routed automatically to the right role.',
    tags: ['Pass / Fail', 'Auto-Approval', 'Rework Recommendation', 'Escalation Workflow'],
    Visual: DecisionVisual,
  },
];

export default function Landing() {
  const router = useRouter();
  const sectionRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const totalRailPoints = STAGES.length + 2; // hero + stages + CTA

  return (
    <div className="bg-graphite font-body text-ink">
      {/* Progress rail */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-20 flex-col gap-3">
        {Array.from({ length: totalRailPoints }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'bg-signal scale-150' : 'bg-gridline'
            }`}
          />
        ))}
      </div>

      {/* Hero */}
      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        data-index={0}
        className="hero-grid-parallax bg-blueprint bg-grid min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      >
        <span className="text-xs tracking-[0.3em] text-muted font-mono uppercase mb-6">
          Infosys Springboard · VisionInspect AI
        </span>
        <h1 className="font-display font-bold text-4xl md:text-6xl leading-tight max-w-3xl">
          See every defect,
          <br />
          before it leaves the line.
        </h1>
        <p className="text-muted mt-6 max-w-xl text-sm md:text-base">
          An AI-powered quality inspection platform that turns raw product
          images into precise defect detections, severity scores, and
          pass/fail decisions — in seconds.
        </p>
        <div className="mt-10 flex flex-col items-center gap-2 text-muted">
          <span className="text-xs font-mono uppercase tracking-widest">Scroll to see how it works</span>
          <div className="w-px h-10 bg-gradient-to-b from-signal to-transparent animate-pulse" />
        </div>
      </section>

      {/* Pipeline stages */}
      {STAGES.map((stage, i) => {
        const { Visual } = stage;
        const reversed = i % 2 === 1;
        return (
          <section
            key={stage.title}
            ref={(el) => (sectionRefs.current[i + 1] = el)}
            data-index={i + 1}
            className="min-h-screen flex items-center px-6 md:px-16 py-20"
          >
            <div
              className={`max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
                reversed ? 'md:[direction:rtl]' : ''
              }`}
            >
              <div className={reversed ? 'md:[direction:ltr]' : ''}>
                <ScrollReveal>
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-signal">
                    {stage.label}
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl mt-3 mb-4">
                    {stage.title}
                  </h2>
                  <p className="text-muted text-sm md:text-base leading-relaxed mb-6">
                    {stage.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stage.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono border border-gridline px-2 py-1 text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </ScrollReveal>
              </div>
              <div className={reversed ? 'md:[direction:ltr]' : ''}>
                <ScrollReveal delay={150}>
                  <div className="bg-panel border border-gridline p-8 aspect-square max-w-sm mx-auto">
                    <Visual />
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section
        ref={(el) => (sectionRefs.current[STAGES.length + 1] = el)}
        data-index={STAGES.length + 1}
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-blueprint bg-grid"
      >
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-5xl mb-4">
            Ready to run an inspection?
          </h2>
          <p className="text-muted mb-10 max-w-lg mx-auto text-sm md:text-base">
            Sign in as a Quality Engineer to inspect product images, or as a
            Factory Supervisor to monitor production-wide quality.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-signal text-graphite font-display font-semibold px-8 py-3 hover:bg-signal/90 transition-colors"
          >
            Enter Inspection Console
          </button>
        </ScrollReveal>
      </section>
    </div>
  );
}
