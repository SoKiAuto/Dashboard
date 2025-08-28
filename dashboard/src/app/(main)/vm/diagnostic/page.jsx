"use client";

import TopRMS from "./TopRMS";
import BiasOutliers from "./BiasOutliers";
import RodDropAlert from "./RodDropAlert";
import CriticalAlarms from "./CriticalAlarms";
import RPMChart from "./RPMChart";

// Optional reusable card wrapper to give consistent UI
function CardWrapper({ children }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-4 hover:shadow-lg transition">
      {children}
    </div>
  );
}

export default function DiagnosticSummaryPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen w-full">
      {/* Updated section heading with icon */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 p-2 rounded-full">
          {/* Replace emoji with any Heroicon if needed */}
          <span className="text-xl"></span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Diagnostic Summary</h1>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <CardWrapper><TopRMS /></CardWrapper>
        <CardWrapper><BiasOutliers /></CardWrapper>
        <CardWrapper><RodDropAlert /></CardWrapper>
        <CardWrapper><CriticalAlarms /></CardWrapper>
        <CardWrapper><RPMChart /></CardWrapper>
      </div>
    </div>
  );
}
