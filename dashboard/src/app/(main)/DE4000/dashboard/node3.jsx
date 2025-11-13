"use client";

import AnalogTopSemiGauge from "../components/Cards/AnalogRadialCard";
import AnalogLabelCard from "../components/Cards/AnalogLabelCard";

export default function Node3() {
  const radialCards = [
    { label: "AIR MANIFOLD LB TEMP", unit: "°C" },
    { label: "AIR MANIFOLD RB TEMP", unit: "°C" },
    { label: "EJW FLOW", unit: "m³/h" },
    { label: "ENGINE RPM", unit: "rpm" },
  ];

  const labelCards = [
    { label: "ENGINE LB VIBRATION", unit: "mm/s" },
    { label: "ENGINE RB VIBRATION", unit: "mm/s" },
    { label: "COOLER DE VIBRATION", unit: "mm/s" },
    { label: "COOLER NDE VIBRATION", unit: "mm/s" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">
      {/* Radial Gauges */}
      <div className="flex flex-wrap justify-center gap-8">
        {radialCards.map((item, i) => (
          <AnalogTopSemiGauge
            key={i}
            label={item.label}
            value={Math.floor(Math.random() * 100)}
            unit={item.unit}
          />
        ))}
      </div>

      {/* Label Cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {labelCards.map((item, i) => (
          <AnalogLabelCard
            key={i}
            label={item.label}
            value={Math.floor(Math.random() * 100)}
            unit={item.unit}
          />
        ))}
      </div>
    </div>
  );
}
