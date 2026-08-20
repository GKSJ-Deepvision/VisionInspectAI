import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowRight,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ScanSearch,
  Factory,
  Gauge,
  CheckCircle2,
  Eye,
  TrendingUp,
} from "lucide-react";

function SupervisorWelcome() {
  const navigate = useNavigate();

  // =========================================================
  // DASHBOARD STATS
  // =========================================================

  const [stats, setStats] = useState({
    username: "",
    role: "",
    total: 0,
    defects: 0,
    no_defects: 0,
    critical: 0,
    moderate: 0,
    minor: 0,
    average_confidence: 0,
    quality_score: 0,
    overall_risk: "No Data",
    production_status: "No Data",
    recent: [],
    trend: [],
    outcome_trend: [],
  });

  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // -----------------------------------------------------
      // GET LOGGED-IN USER DETAILS
      // -----------------------------------------------------

      const username =
        localStorage.getItem("username") || "";

      const role =
        localStorage.getItem("role") || "";

      console.log(
        "Dashboard User:",
        username
      );

      console.log(
        "Dashboard Role:",
        role
      );

      // -----------------------------------------------------
      // GET DASHBOARD DATA
      // -----------------------------------------------------

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/dashboard`,
        {
          params: {
            username,
            role,
          },
        }
      );

      console.log(
        "DASHBOARD RESPONSE:",
        res.data
      );

      // -----------------------------------------------------
      // UPDATE STATE
      // -----------------------------------------------------

      setStats(res.data);

    } catch (error) {

      console.error(
        "Supervisor welcome dashboard error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // QUALITY SCORE
  // =========================================================

  const qualityScore =
    stats.quality_score !== undefined
      ? stats.quality_score
      : 0;

  // =========================================================
  // QUALITY STATUS
  // =========================================================

  const getQualityStatus = () => {

    if (qualityScore >= 90) {
      return "Excellent";
    }

    if (qualityScore >= 75) {
      return "Good";
    }

    if (qualityScore > 0) {
      return "Needs Attention";
    }

    return "No Data";
  };

  // =========================================================
  // RISK COLOR
  // =========================================================

  const getRiskColor = () => {

    const risk =
      String(stats.overall_risk)
        .toLowerCase();

    if (risk.includes("low")) {
      return "text-emerald-400";
    }

    if (
      risk.includes("medium") ||
      risk.includes("moderate")
    ) {
      return "text-orange-400";
    }

    if (
      risk.includes("high") ||
      risk.includes("critical")
    ) {
      return "text-red-400";
    }

    return "text-gray-300";
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-white overflow-hidden">

      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="fixed inset-0 pointer-events-none">

        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -bottom-60 -right-60 w-[650px] h-[650px] rounded-full bg-blue-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

      </div>


      {/* ================================================= */}
      {/* TOP NAVBAR */}
      {/* ================================================= */}

      <header className="relative z-20 h-[76px] border-b border-gray-700/70 bg-[#0F172A]/90 backdrop-blur-xl">

        <div className="h-full px-6 sm:px-10 flex items-center justify-between">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">

              <span className="font-bold">
                VI
              </span>

            </div>

            <div>

              <h1 className="font-bold text-xl sm:text-2xl">
                VisionInspect AI
              </h1>

              <p className="text-[16px] text-gray-400">
                Factory Quality Control Center
              </p>

            </div>

          </div>


          {/* SYSTEM STATUS */}

          <div className="hidden sm:flex items-center gap-3">

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />

                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />

              </span>

              <span className="text-xs text-emerald-400 font-medium">
                SYSTEM LIVE
              </span>

            </div>

          </div>

        </div>

      </header>


      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-12">

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">


          {/* ================================================= */}
          {/* LEFT CONTENT */}
          {/* ================================================= */}

          <section>

            {/* BADGE */}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-semibold tracking-wide">

              <Factory size={13} />

              FACTORY QUALITY CONTROL CENTER

            </div>


            {/* HEADING */}

            <h2 className="mt-7 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">

              Monitor the

              <span className="block text-emerald-400">
                Factory.
              </span>

              <span className="block">
                Control the Quality.
              </span>

            </h2>


            {/* DESCRIPTION */}

            <p className="mt-6 max-w-xl text-sm sm:text-base text-gray-400 leading-7">

              Get a real-time overview of manufacturing quality,
              inspection performance, defect patterns and production
              risk — all from one intelligent quality control center.

            </p>


            {/* ACTION BUTTONS */}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">

              <button
                onClick={() =>
                  navigate("/supervisor-dashboard")
                }
                className="group flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/20"
              >

                Open Quality Dashboard

                <ArrowRight
                  size={17}
                  className="group-hover:translate-x-1 transition-transform"
                />

              </button>


              <button
                onClick={() =>
                  navigate("/inspection")
                }
                className="flex items-center justify-center gap-2 bg-[#1F2937] hover:bg-[#374151] border border-gray-700 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
              >

                <ScanSearch size={16} />

                View Inspections

              </button>

            </div>


            {/* ================================================= */}
            {/* QUICK STATUS CARDS */}
            {/* ================================================= */}

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">

              {/* PRODUCTION QUALITY */}

              <MiniCard
                icon={<Gauge size={16} />}
                title="Production Quality"
                value={
                  loading
                    ? "..."
                    : stats.total > 0
                    ? `${qualityScore}%`
                    : "No Data"
                }
                status={
                  stats.total > 0
                    ? getQualityStatus()
                    : "Awaiting Data"
                }
              />


              {/* QUALITY RISK */}

              <MiniCard
                icon={<ShieldCheck size={16} />}
                title="Quality Risk"
                value={
                  loading
                    ? "..."
                    : stats.overall_risk || "No Data"
                }
                status="Factory Level"
                valueClass={getRiskColor()}
              />


              {/* DEFECT MONITORING */}

              <MiniCard
                icon={<AlertTriangle size={16} />}
                title="Defect Monitoring"
                value={
                  loading
                    ? "..."
                    : stats.defects
                }
                status={
                  stats.defects > 0
                    ? "Active Alerts"
                    : "No Alerts"
                }
                valueClass={
                  stats.defects > 0
                    ? "text-orange-400"
                    : "text-emerald-400"
                }
              />


              {/* INSPECTION FLOW */}

              <MiniCard
                icon={<Activity size={16} />}
                title="Inspection Flow"
                value={
                  loading
                    ? "..."
                    : stats.total
                }
                status="Total Inspections"
                valueClass="text-blue-400"
              />

            </div>

          </section>


          {/* ================================================= */}
          {/* RIGHT FACTORY HEALTH PANEL */}
          {/* ================================================= */}

          <section className="relative">

            <div className="relative bg-[#1F2937] border border-gray-700 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden">

              {/* GLOW */}

              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none" />


              {/* PANEL HEADER */}

              <div className="relative flex items-center justify-between mb-7">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">

                    <Activity
                      size={19}
                      className="text-emerald-400"
                    />

                  </div>

                  <div>

                    <p className="font-semibold text-sm">
                      Factory Health
                    </p>

                    <p className="text-[10px] text-gray-500">
                      AI quality monitoring
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                  <span className="text-[9px] text-emerald-400">
                    LIVE
                  </span>

                </div>

              </div>


              {/* ================================================= */}
              {/* QUALITY SCORE */}
              {/* ================================================= */}

              <div className="flex justify-center mb-7">

                <div className="relative w-36 h-36 rounded-full border-[7px] border-gray-600/60 flex items-center justify-center">

                  {/* PROGRESS RING */}

                  <div
                    className="absolute inset-[-7px] rounded-full"
                    style={{
                      background: `conic-gradient(
                        #10B981 ${
                          Math.min(
                            qualityScore,
                            100
                          ) * 3.6
                        }deg,
                        transparent 0deg
                      )`,
                      mask:
                        "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 0)",
                      WebkitMask:
                        "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 0)",
                    }}
                  />

                  <div className="text-center">

                    <p className="text-4xl font-bold">

                      {loading
                        ? "..."
                        : stats.total > 0
                        ? qualityScore
                        : "--"}

                    </p>

                    <p className="text-[8px] text-gray-400 tracking-wide mt-1">
                      QUALITY SCORE
                    </p>

                  </div>

                </div>

              </div>


              {/* ================================================= */}
              {/* HEALTH METRICS */}
              {/* ================================================= */}

              <div className="grid grid-cols-2 gap-2.5">

                {/* RISK LEVEL */}

                <HealthCard
                  icon={<ShieldCheck size={16} />}
                  label="Risk Level"
                  value={
                    loading
                      ? "..."
                      : stats.overall_risk || "No Data"
                  }
                  iconClass={getRiskColor()}
                />


                {/* QUALITY STATUS */}

                <HealthCard
                  icon={<CheckCircle2 size={16} />}
                  label="Quality Status"
                  value={
                    loading
                      ? "..."
                      : stats.production_status ||
                        "No Data"
                  }
                  iconClass="text-emerald-400"
                />


                {/* DEFECT ALERTS */}

                <HealthCard
                  icon={<AlertTriangle size={16} />}
                  label="Defect Alerts"
                  value={
                    loading
                      ? "..."
                      : stats.critical > 0
                      ? `${stats.critical} High`
                      : "None"
                  }
                  iconClass={
                    stats.critical > 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }
                />


                {/* INSPECTIONS */}

                <HealthCard
                  icon={<Eye size={16} />}
                  label="Inspections"
                  value={
                    loading
                      ? "..."
                      : stats.total
                  }
                  iconClass="text-blue-400"
                />

              </div>


              {/* ================================================= */}
              {/* AI INSIGHT */}
              {/* ================================================= */}

              <div className="mt-3 p-4 rounded-xl bg-[#111827] border border-gray-700">

                <div className="flex items-start gap-3">

                  <div className="w-8 h-8 shrink-0 rounded-lg bg-purple-500/10 flex items-center justify-center">

                    <TrendingUp
                      size={15}
                      className="text-purple-400"
                    />

                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <p className="text-xs font-semibold text-white">
                        AI Quality Insight
                      </p>

                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                        AI
                      </span>

                    </div>

                    <p className="text-[10px] text-gray-300 mt-2 leading-5">

                      {stats.total === 0
                        ? "Factory quality insights will appear after inspection data is available."
                        : stats.critical > 0
                        ? "High-severity defects require immediate quality review and production monitoring."
                        : stats.defects > 0
                        ? "Defects are being monitored. Review recurring defect categories for process improvement."
                        : "Factory quality is currently stable. Continue routine monitoring and inspection."}

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>


        {/* ================================================= */}
        {/* BOTTOM CONTROL STRIP */}
        {/* ================================================= */}

        <section className="mt-10 grid sm:grid-cols-3 gap-4">

          <ControlCard
            icon={<BarIcon />}
            title="Quality Analytics"
            description="Review factory performance trends"
            onClick={() =>
              navigate("/supervisor-dashboard")
            }
          />


          <ControlCard
            icon={<ScanSearch size={19} />}
            title="Inspection Activity"
            description="View recent inspection results"
            onClick={() =>
              navigate("/inspection")
            }
          />


          <ControlCard
            icon={<ShieldCheck size={19} />}
            title="Risk Monitoring"
            description="Monitor factory-level quality risk"
            onClick={() =>
              navigate("/supervisor-dashboard")
            }
          />

        </section>


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-600">

          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

          VisionInspect AI • Factory Quality Intelligence

        </div>

      </main>

    </div>
  );
}


/* ========================================================= */
/* MINI CARD */
/* ========================================================= */

function MiniCard({
  icon,
  title,
  value,
  status,
  valueClass = "text-white",
}) {
  return (
    <div className="bg-[#1F2937] border border-gray-700 rounded-xl p-3 hover:border-emerald-500/30 transition-all duration-300">

      {/* ICON */}

      <div className="w-7 h-7 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-300">

        {icon}

      </div>


      {/* LABEL */}

      <p className="text-[10px] font-medium text-gray-300 mt-3">
        {title}
      </p>


      {/* VALUE */}

      <p
        className={`text-sm font-bold mt-1 ${valueClass}`}
      >
        {value}
      </p>


      {/* STATUS */}

      <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">
        {status}
      </p>
    </div>
  );
}


/* ========================================================= */
/* HEALTH CARD */
/* ========================================================= */

function HealthCard({
  icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="bg-[#111827] border border-gray-700 rounded-lg p-3">

      {/* ICON */}

      <div
        className={`w-7 h-7 rounded-lg bg-gray-700/40 flex items-center justify-center ${iconClass}`}
      >
        {icon}
      </div>


      {/* LABEL */}

      <p className="text-[9px] font-medium text-gray-300 mt-2">
        {label}
      </p>


      {/* VALUE */}

      <p className="text-xs font-semibold text-white mt-1">
        {value}
      </p>

    </div>
  );
}


/* ========================================================= */
/* CONTROL CARD */
/* ========================================================= */

function ControlCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-[#1F2937] border border-gray-700 hover:border-emerald-500/40 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
    >

      <div className="flex items-center justify-between">

        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          {icon}
        </div>

        <ArrowRight
          size={16}
          className="text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
        />

      </div>

      <p className="mt-4 text-sm font-semibold text-white">
        {title}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>

    </button>
  );
}


/* ========================================================= */
/* BAR ICON */
/* ========================================================= */

function BarIcon() {
  return (
    <div className="flex items-end gap-[3px] h-4">

      <span className="w-[3px] h-2 bg-current rounded-full" />

      <span className="w-[3px] h-4 bg-current rounded-full" />

      <span className="w-[3px] h-3 bg-current rounded-full" />

    </div>
  );
}


export default SupervisorWelcome;