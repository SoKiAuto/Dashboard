"use client";

import AnalogLabelCard from "../components/Cards/AnalogLabelCard";

export default function Node4() {
  const rows = [
    [
      "ENGINE EXHAUST CYL#1 RB",
      "ENGINE EXHAUST CYL#2 RB",
      "ENGINE EXHAUST CYL#3 RB",
      "ENGINE EXHAUST CYL#4 RB",
      "ENGINE EXHAUST CYL#5 RB",
    ],
    [
      "ENGINE EXHAUST CYL#1 LB",
      "ENGINE EXHAUST CYL#2 LB",
      "ENGINE EXHAUST CYL#3 LB",
      "ENGINE EXHAUST CYL#4 LB",
      "ENGINE EXHAUST CYL#5 LB",
    ],
    [
      "ENGINE EXHAUST COMMON RB",
      "ENGINE EXHAUST COMMON LB",
      "AIR MANIFOLD RB TEMP",
      "AIR MANIFOLD LB TEMP",
    ],
    ["ENGINE RPM"],
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6 overflow-hidden">
      {rows.map((cards, i) => (
        <div key={i} className="flex flex-wrap justify-center gap-6">
          {cards.map((label, j) => (
            <AnalogLabelCard key={j} label={label} value={Math.floor(Math.random() * 100)} />
          ))}
        </div>
      ))}
    </div>
  );
}
