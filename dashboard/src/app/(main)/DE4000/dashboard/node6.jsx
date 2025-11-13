"use client";

import AnalogTopSemiGauge from "../components/Cards/AnalogRadialCard";
import AnalogLabelCard from "../components/Cards/AnalogLabelCard";

export default function Node6() {
  const topRadials = [
    { label: "ENGINE RPM", unit: "RPM" },
    { label: "STG1 SUCT PRESSURE", unit: "bar" },
    { label: "FINAL DISCH PRESSURE", unit: "bar" },
  ];

  const labelCards = [
    { label: "ENGINE SPEED CONTROL SIGNAL", unit: "%" },
    { label: "RECYCLE CONTROL VALVE", unit: "%" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">
      {/* Top Radials */}
      <div className="flex flex-wrap justify-center gap-8">
        {topRadials.map((item, i) => (
          <AnalogTopSemiGauge
            key={i}
            label={item.label}
            unit={item.unit}
            value={Math.floor(Math.random() * 100)}
          />
        ))}
      </div>

      {/* Label Cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {labelCards.map((item, i) => (
          <AnalogLabelCard
            key={i}
            label={item.label}
            unit={item.unit}
            value={Math.floor(Math.random() * 100)}
          />
        ))}
      </div>
    </div>
  );
}
