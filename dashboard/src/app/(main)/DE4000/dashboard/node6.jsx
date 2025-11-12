"use client";

import AnalogTopSemiGauge from "../components/Cards/AnalogRadialCard";
import AnalogLabelCard from "../components/Cards/AnalogLabelCard";

export default function Node6() {
  const topRadials = ["ENGINE RPM", "STG1 SUCT PRESSURE", "FINAL DISCH PRESSURE"];
  const labelCards = ["ENGINE SPEED CONTROL SIGNAL", "RECYCLE CONTROL VALVE"];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">
      <div className="flex flex-wrap justify-center gap-8">
        {topRadials.map((label, i) => (
          <AnalogTopSemiGauge key={i} label={label} value={Math.floor(Math.random() * 100)} />
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {labelCards.map((label, i) => (
          <AnalogLabelCard key={i} label={label} value={Math.floor(Math.random() * 100)} />
        ))}
      </div>
    </div>
  );
}
