// dashboard/src/app/(main)/vm/radar/page.jsx
"use client";
import VMRadarChart from "@/components/VMRadarChart";

export default function VMRadarPage() {
  return (
    <div className="min-h-screen w-full p-4 sm:p-6 md:p-8 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6 tracking-tight">
          VM Radar Overview
        </h1>
        <VMRadarChart />
      </div>
    </div>
  );
}
