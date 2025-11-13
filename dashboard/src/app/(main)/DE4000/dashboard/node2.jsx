"use client";

import AnalogTopSemiGauge from "../components/Cards/AnalogRadialCard";
import AnalogLabelCard from "../components/Cards/AnalogLabelCard";

export default function Node2() {
  const topRadials = [
    { label: "COMP OIL HEADER PRESS", unit: "bar" },
    { label: "ENGINE LUBE OIL PRESS", unit: "bar" },
    { label: "FUEL GAS INLET PRESS", unit: "psi" },
  ];

  const midLabels = [
    { label: "COMP OIL HEADER TEMP", unit: "°C" },
    { label: "ENGINE LUBE OIL TEMP", unit: "°C" },
    { label: "FUEL GAS INLET TEMP", unit: "°C" },
  ];

  const bottomRadials = [
    { label: "INSTRUMENT AIR PRESS", unit: "psi" },
    { label: "START AIR PRESS", unit: "psi" },
    { label: "FINAL DISCH PRESS", unit: "psi" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">
      {/* Top Radial Gauges */}
      <div className="flex flex-wrap justify-center gap-8">
        {topRadials.map((item, i) => (
          <AnalogTopSemiGauge
            key={i}
            label={item.label}
            value={Math.floor(Math.random() * 100)}
            unit={item.unit}
          />
        ))}
      </div>

      {/* Mid Label Cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {midLabels.map((item, i) => (
          <AnalogLabelCard
            key={i}
            label={item.label}
            value={Math.floor(Math.random() * 100)}
            unit={item.unit}
          />
        ))}
      </div>

      {/* Bottom Radial Gauges */}
      <div className="flex flex-wrap justify-center gap-8">
        {bottomRadials.map((item, i) => (
          <AnalogTopSemiGauge
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
