"use client";
import VMRadarChart from "@/components/VMRadarChart";
import BackToVMButton from "@/components/BackToVMButton";  // ✅ NEW

export default function VMRadarPage() {
  return (
    <div className="min-h-screen w-full p-4 sm:p-6 md:p-8 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* Header with title and back button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            VM Radar Overview
          </h1>
          <BackToVMButton />
        </div>

        <VMRadarChart />
      </div>
    </div>
  );
}
