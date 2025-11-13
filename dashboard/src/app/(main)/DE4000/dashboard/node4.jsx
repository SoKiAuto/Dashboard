"use client";

import AnalogLabelCard from "../components/Cards/AnalogLabelCard";

export default function Node4() {
  const rows = [
    [
      { label: "ENGINE EXHAUST CYL#1 RB", unit: "°C" },
      { label: "ENGINE EXHAUST CYL#2 RB", unit: "°C" },
      { label: "ENGINE EXHAUST CYL#3 RB", unit: "°C" },
      { label: "ENGINE EXHAUST CYL#4 RB", unit: "°C" },
      { label: "ENGINE EXHAUST CYL#5 RB", unit: "°C" },
    ],
    [
      { label: "ENGINE EXHAUST CYL#1 LB", unit: "°C" },
      { label: "ENGINE EXHAUST CYL#2 LB", unit: "°C" },
      { label: "ENGINE EXHAUST CYL#3 LB", unit: "°C" },
      { label: "ENGINE EXHAUST CYL#4 LB", unit: "°C" },
      { label: "ENGINE EXHAUST CYL#5 LB", unit: "°C" },
    ],
    [
      { label: "ENGINE EXHAUST COMMON RB", unit: "°C" },
      { label: "ENGINE EXHAUST COMMON LB", unit: "°C" },
      { label: "AIR MANIFOLD RB TEMP", unit: "°C" },
      { label: "AIR MANIFOLD LB TEMP", unit: "°C" },
    ],
    [
      { label: "ENGINE RPM", unit: "rpm" },
    ],
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6 overflow-hidden">
      {rows.map((cards, i) => (
        <div key={i} className="flex flex-wrap justify-center gap-6">
          {cards.map((item, j) => (
            <AnalogLabelCard
              key={j}
              label={item.label}
              value={Math.floor(Math.random() * 100)}
              unit={item.unit}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
