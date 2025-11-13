"use client";

import AnalogTopSemiGauge from "../components/Cards/AnalogRadialCard";
import AnalogLabelCard from "../components/Cards/AnalogLabelCard";
import DiscreteChannelCard from "../components/Cards/DiscreteChannelCard";

export default function Node1() {
  // 🔹 1st Row: Radial Pressure Gauges
  const radialCards = [
    { label: "STG1 SUC PRESSURE", unit: "bar" },
    { label: "STG1 DISCH PRESSURE", unit: "bar" },
    { label: "STG2 SUC PRESSURE", unit: "bar" },
    { label: "STG2 DISCH PRESSURE", unit: "bar" },
  ];

  // 🔹 2nd Row: Temperature Labels
  const labelCards = [
    { label: "STG1 SUC TEMP", unit: "°C" },
    { label: "STG1 DISCH TEMP", unit: "°C" },
    { label: "STG2 SUC TEMP", unit: "°C" },
    { label: "STG2 DISCH TEMP", unit: "°C" },
  ];

  // 🔹 3rd Row: Discrete Controls
  const discreteCards = [
    { name: "Fuel" },
    { name: "Ignition" },
    { name: "Crank" },
    { name: "PreLube" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">
      {/* 1️⃣ Row – Pressure Gauges */}
      <div className="flex flex-wrap justify-center gap-8">
        {radialCards.map((card, i) => (
          <AnalogTopSemiGauge
            key={i}
            label={card.label}
            unit={card.unit}
            value={Math.floor(Math.random() * 100)}
          />
        ))}
      </div>

      {/* 2️⃣ Row – Temperature Labels */}
      <div className="flex flex-wrap justify-center gap-6">
        {labelCards.map((card, i) => (
          <AnalogLabelCard
            key={i}
            label={card.label}
            unit={card.unit}
            value={Math.floor(Math.random() * 100)}
          />
        ))}
      </div>

      {/* 3️⃣ Row – Discrete Channels */}
      <div className="flex flex-wrap justify-center gap-4">
        {discreteCards.map((card, i) => (
          <DiscreteChannelCard
            key={i}
            name={card.name}
            state={Math.random() > 0.5}
          />
        ))}
      </div>
    </div>
  );
}
