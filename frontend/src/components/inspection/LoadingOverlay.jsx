import {
  CpuChipIcon,
} from "@heroicons/react/24/outline";

export default function LoadingOverlay({
  show,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">

      <div className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 p-6 sm:p-10 w-full max-w-[430px]">

        <div className="flex justify-center">

          <div className="animate-spin rounded-full h-20 w-20 border-[6px] border-blue-500 border-t-transparent"></div>

        </div>

        <div className="flex justify-center mt-8">

          <CpuChipIcon className="h-8 w-8 text-blue-400" />

        </div>

        <h2 className="text-2xl font-bold text-center text-white mt-5">

          AI Inspection Running

        </h2>

        <p className="text-gray-400 text-center mt-3">

          Please wait while VisionInspect AI analyzes the uploaded image.

        </p>

        <div className="mt-8">

          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">

            <div className="h-full bg-blue-500 animate-pulse w-full"></div>

          </div>

        </div>

        <p className="text-center text-sm text-gray-500 mt-5">

          Generating anomaly map • Classifying defect • Calculating severity

        </p>

      </div>

    </div>
  );
}