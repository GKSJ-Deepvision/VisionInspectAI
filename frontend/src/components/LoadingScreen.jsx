import { Bot, Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-700 via-cyan-600 to-indigo-700 flex items-center justify-center z-50">

      {/* Background Blur */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Card */}
      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 flex flex-col items-center">

        {/* Logo */}
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl animate-pulse">

          <Bot
            size={50}
            className="text-blue-600"
          />

        </div>

        {/* Title */}
        <h1 className="mt-6 text-4xl font-bold text-white">
          VisionInspect AI
        </h1>

        <p className="text-blue-100 mt-2 text-lg">
          Manufacturing Defect Detection
        </p>

        {/* Spinner */}
        <div className="mt-8 flex items-center gap-3">

          <Loader2
            size={28}
            className="animate-spin text-white"
          />

          <span className="text-white text-lg font-medium">
            Loading Dashboard...
          </span>

        </div>

        {/* Progress Bar */}
        <div className="w-72 h-2 bg-white/20 rounded-full mt-8 overflow-hidden">

          <div className="h-full w-full bg-white rounded-full animate-pulse"></div>

        </div>

      </div>

    </div>
  );
}