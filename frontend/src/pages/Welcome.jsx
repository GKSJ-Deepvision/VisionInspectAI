import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  X,
  ScanSearch,
  BrainCircuit,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Activity,
  ImageIcon,
  Layers,
  AlertTriangle,
  FileText,
  Sparkles,
  ChevronRight,
  Factory,
} from "lucide-react";

function Welcome() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Sequential inspection pipeline animation
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 1800);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <div className="min-h-screen w-full bg-[#111827] text-white overflow-x-hidden">

      {/* ================= BACKGROUND ================= */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-52 -left-52 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -bottom-60 -right-52 w-[650px] h-[650px] rounded-full bg-emerald-400/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#6ee7b7 1px, transparent 1px), linear-gradient(90deg, #6ee7b7 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

      </div>


      {/* ================= NAVBAR ================= */}

      <header className="relative z-30 h-[76px] border-b border-gray-700/70 bg-[#111827]/85 backdrop-blur-xl">

        <div className="h-full px-5 sm:px-8 lg:px-12 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-bold text-white">
                VI
              </span>
            </div>

            <div>

              <h1 className="font-bold text-base sm:text-lg tracking-tight">
                VisionInspect AI
              </h1>

              <p className="text-[12px] sm:text-[13px] text-gray-400">
                Manufacturing Quality Inspection
              </p>

            </div>

          </div>


          {/* Dashboard */}

          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/10"
          >

            Dashboard

            <ArrowRight
              size={15}
              className="group-hover:translate-x-1 transition-transform"
            />

          </button>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

        {/* ================= HERO ================= */}

        <section
          className={`flex flex-col items-center text-center transition-all duration-700 ${
            open
              ? "pt-12 pb-8"
              : "min-h-[calc(100vh-76px)] justify-center py-10"
          }`}
        >

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-xs font-semibold tracking-wide">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />

              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />

            </span>

            AI-POWERED MANUFACTURING INSPECTION

          </div>


          {/* Heading */}

          <h2 className="mt-6 max-w-4xl text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05]">

            See Defects.

            <span className="block text-emerald-400 mt-2">
              Understand Risk.
            </span>

            <span className="block mt-2">
              Improve Quality.
            </span>

          </h2>


          {/* Description */}

          <p className="mt-6 max-w-2xl text-sm sm:text-base lg:text-lg text-gray-400 leading-7">

            VisionInspect AI transforms manufacturing images into intelligent
            quality insights through AI-powered defect detection, severity
            assessment, risk analysis, and inspection reporting.

          </p>


          {/* ================= AI CORE ================= */}

          {!open && (

            <div className="mt-10 flex flex-col items-center">

              <button
                onClick={() => {
                  setOpen(true);
                  setActiveStep(0);
                }}
                className="group relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#1F2937] border border-emerald-500/30 hover:border-emerald-400/70 transition-all duration-500 shadow-2xl shadow-emerald-500/10"
              >

                <div className="absolute inset-[-14px] rounded-full border border-emerald-500/10 group-hover:border-emerald-500/30 group-hover:scale-110 transition-all duration-700" />

                <div className="absolute inset-[-5px] rounded-full border-t-2 border-r border-emerald-400/80 animate-spin [animation-duration:4s]" />

                <div className="absolute inset-8 rounded-full bg-emerald-500/10 flex flex-col items-center justify-center group-hover:bg-emerald-500/15 transition-colors">

                  <BrainCircuit
                    size={38}
                    className="text-emerald-400 group-hover:scale-110 transition-transform duration-300"
                  />

                  <span className="mt-2 text-[10px] tracking-[0.2em] text-gray-400">
                    AI CORE
                  </span>

                </div>

                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#111827] border border-gray-700 text-[9px] text-emerald-400 whitespace-nowrap">
                  SYSTEM READY
                </span>

              </button>


              <button
                onClick={() => {
                  setOpen(true);
                  setActiveStep(0);
                }}
                className="mt-9 group flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >

                Explore Inspection Workflow

                <ChevronRight
                  size={17}
                  className="group-hover:translate-x-1 transition-transform"
                />

              </button>

            </div>

          )}

        </section>


        {/* ================= INSPECTION CONSOLE ================= */}

        <div
          className={`transition-all duration-700 ease-in-out overflow-hidden ${
            open
              ? "max-h-[1400px] opacity-100 scale-100 mb-16"
              : "max-h-0 opacity-0 scale-[0.96]"
          }`}
        >

          <section className="relative bg-[#1F2937] border border-gray-700 rounded-3xl shadow-2xl overflow-hidden">

            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none" />


            {/* ================= CONSOLE HEADER ================= */}

            <div className="relative z-10 px-5 sm:px-7 lg:px-8 py-4 border-b border-gray-700 flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">

                  <Sparkles
                    size={19}
                    className="text-emerald-400"
                  />

                </div>

                <div className="text-left">

                  <p className="font-semibold text-sm">
                    AI Inspection Console
                  </p>

                  <p className="text-[10px] text-gray-300">
                    Intelligent Manufacturing Quality Analysis
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-4">

                <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400">

                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                  System Ready

                </div>


                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-lg border border-gray-600 hover:border-red-400 hover:text-red-400 flex items-center justify-center transition-all"
                >

                  <X size={17} />

                </button>

              </div>

            </div>


            {/* ================= CONSOLE BODY ================= */}

            <div className="relative z-10 p-5 sm:p-7 lg:p-9">

              <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-center">


                {/* ================= VISUAL ================= */}

                <div className="relative h-[290px] sm:h-[340px] rounded-2xl bg-[#111827] border border-gray-700 overflow-hidden">

                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)",
                      backgroundSize: "30px 30px",
                    }}
                  />

                  <div className="absolute left-0 right-0 top-0 h-[2px] bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)] animate-[inspectionScan_3s_linear_infinite]" />

                  <div className="absolute inset-0 flex items-center justify-center">

                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-500 flex items-center justify-center shadow-2xl">

                      <Factory
                        size={60}
                        className="text-gray-400"
                      />

                      <div className="absolute -right-7 top-7 w-24 h-20 border-2 border-red-400">

                        <span className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-1 rounded text-[9px] font-bold">
                          DEFECT
                        </span>

                      </div>

                      <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

                    </div>

                  </div>

                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1F2937]/95 border border-gray-600">

                    <ScanSearch
                      size={14}
                      className="text-emerald-400"
                    />

                    <span className="text-[10px] text-gray-300">
                      Computer Vision Analysis
                    </span>

                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1F2937]/95 border border-gray-600">

                    <Activity
                      size={14}
                      className="text-emerald-400"
                    />

                    <span className="text-[10px] text-gray-300">
                      AI Analysis Active
                    </span>

                  </div>

                </div>


                {/* ================= WORKFLOW ================= */}

                <div className="text-left">

                  <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400">
                    INSPECTION PIPELINE
                  </p>

                  <h3 className="mt-2 text-2xl sm:text-3xl font-bold">

                    From image to

                    <span className="text-emerald-400">
                      {" "}quality decision.
                    </span>

                  </h3>

                  <p className="mt-4 text-sm text-gray-400 leading-6">

                    Every uploaded manufacturing image passes through an
                    intelligent inspection workflow before generating the
                    final quality assessment.

                  </p>


                  <div className="mt-6 space-y-3">

                    <WorkflowStep
                      number="01"
                      icon={<ImageIcon size={17} />}
                      title="Image Preprocessing"
                      description="Prepare the image for AI analysis."
                      active={activeStep === 0}
                    />

                    <WorkflowStep
                      number="02"
                      icon={<BrainCircuit size={17} />}
                      title="AI Prediction"
                      description="Determine the overall product condition."
                      active={activeStep === 1}
                    />

                    <WorkflowStep
                      number="03"
                      icon={<ScanSearch size={17} />}
                      title="Object Detection"
                      description="Detect and localize manufacturing defects."
                      active={activeStep === 2}
                    />

                    <WorkflowStep
                      number="04"
                      icon={<ShieldCheck size={17} />}
                      title="Severity Assessment"
                      description="Evaluate the severity of detected defects."
                      active={activeStep === 3}
                    />

                    <WorkflowStep
                      number="05"
                      icon={<AlertTriangle size={17} />}
                      title="Quality Risk Assessment"
                      description="Determine the quality risk level."
                      active={activeStep === 4}
                    />

                    <WorkflowStep
                      number="06"
                      icon={<FileText size={17} />}
                      title="Inspection Report"
                      description="Generate a complete quality inspection report."
                      active={activeStep === 5}
                    />

                  </div>

                </div>

              </div>


              {/* ================= FEATURE STRIP ================= */}

              <div className="mt-8 pt-7 border-t border-gray-700">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                  <FeatureItem
                    icon={<ScanSearch size={18} />}
                    title="Defect Detection"
                  />

                  <FeatureItem
                    icon={<Layers size={18} />}
                    title="Defect Category"
                  />

                  <FeatureItem
                    icon={<ShieldCheck size={18} />}
                    title="Severity Scoring"
                  />

                  <FeatureItem
                    icon={<BarChart3 size={18} />}
                    title="Quality Insights"
                  />

                </div>

              </div>


              {/* ================= ACTION ================= */}

              <div className="mt-7 pt-6 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-500 text-center sm:text-left">

                  <CheckCircle2
                    size={16}
                    className="text-emerald-400 shrink-0"
                  />

                  <span>
                    Ready for a new inspection
                  </span>

                </div>


                <button
                  onClick={() => navigate("/upload")}
                  className="
                    group
                    w-full
                    sm:w-auto
                    min-h-[48px]
                    flex
                    items-center
                    justify-center
                    gap-3
                    bg-emerald-500
                    hover:bg-emerald-600
                    px-5
                    sm:px-7
                    py-3.5
                    rounded-xl
                    font-semibold
                    text-sm
                    transition-all
                    duration-300
                    shadow-lg
                    shadow-emerald-500/10
                    whitespace-nowrap
                  "
                >

                  Start New Inspection

                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition-transform shrink-0"
                  />

                </button>

              </div>

            </div>

          </section>

        </div>

      </main>


      {/* ================= CUSTOM ANIMATION ================= */}

      <style>
        {`
          @keyframes inspectionScan {
            0% {
              transform: translateY(0);
              opacity: 0;
            }

            10% {
              opacity: 1;
            }

            90% {
              opacity: 1;
            }

            100% {
              transform: translateY(340px);
              opacity: 0;
            }
          }
        `}
      </style>

    </div>
  );
}


/* ================================================= */
/*                 WORKFLOW STEP                     */
/* ================================================= */

function WorkflowStep({
  number,
  icon,
  title,
  description,
  active,
}) {
  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${
        active
          ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5 scale-[1.015]"
          : "bg-[#111827] border-gray-700"
      }`}
    >

      <div
        className={`w-6 shrink-0 text-[9px] font-mono transition-colors ${
          active
            ? "text-emerald-400"
            : "text-gray-600"
        }`}
      >
        {number}
      </div>


      <div
        className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all duration-500 ${
          active
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-gray-700/50 text-gray-400"
        }`}
      >
        {icon}
      </div>


      <div className="min-w-0">

        <p
          className={`text-xs font-semibold transition-colors ${
            active
              ? "text-white"
              : "text-gray-300"
          }`}
        >
          {title}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {description}
        </p>

      </div>


      {active && (

        <div className="ml-auto flex items-center gap-2 shrink-0">

          <span className="hidden sm:block text-[9px] text-emerald-400 font-medium">
            ACTIVE
          </span>

          <span className="relative flex h-2 w-2">

            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />

            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />

          </span>

        </div>

      )}

    </div>
  );
}


/* ================================================= */
/*                 FEATURE ITEM                      */
/* ================================================= */

function FeatureItem({ icon, title }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111827] border border-gray-700 hover:border-emerald-500/30 transition-all duration-300">

      <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
        {icon}
      </div>

      <span className="text-[10px] sm:text-xs font-medium text-gray-300">
        {title}
      </span>

    </div>
  );
}


export default Welcome;
