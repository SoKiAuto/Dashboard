"use client";

import AnalogTopSemiGauge from "../components/Cards/AnalogRadialCard";
import AnalogLabelCard from "../components/Cards/AnalogLabelCard";

export default function Node3() {
  const radialCards = [
    "AIR MANIFOLD LB TEMP",
    "AIR MANIFOLD RB TEMP",
    "EJW FLOW",
    "ENGINE RPM",
  ];

  const labelCards = [
    "ENGINE LB VIBRATION",
    "ENGINE RB VIBRATION",
    "COOLER DE VIBRATION",
    "COOLER NDE VIBRATION",
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">
      <div className="flex flex-wrap justify-center gap-8">
        {radialCards.map((label, i) => (
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
