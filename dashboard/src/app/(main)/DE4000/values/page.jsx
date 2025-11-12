"use client";

import React, { useState } from "react";
import ValueTile from "../components/ValueTile";
import ValuesToolbar from "../components/ValuesToolbar";

export default function DE4000ValuesPage() {
  const [tab, setTab] = useState("All");

  // --- Tag names from all nodes combined ---
  const tags = [
    // Node 1
    "STG1 SUC PRESSURE", "STG1 DISCH PRESSURE",
    "STG2 SUC PRESSURE", "STG2 DISCH PRESSURE",
    "STG1 SUC TEMP", "STG1 DISCH TEMP",
    "STG2 SUC TEMP", "STG2 DISCH TEMP",
    "Fuel", "Ignition", "Crank", "PreLube",

    // Node 2
    "COMP OIL HEADER PRESS", "ENGINE LUBE OIL PRESS", "FUEL GAS INLET PRESS",
    "COMP OIL HEADER TEMP", "ENGINE LUBE OIL TEMP", "FUEL GAS INLET TEMP",
    "INSTRUMENT AIR PRESS", "START AIR PRESS", "FINAL DISCH PRESS",

    // Node 3
    "AIR MANIFOLD LB TEMP", "AIR MANIFOLD RB TEMP", "EJW FLOW", "ENGINE RPM",
    "ENGINE LB VIBRATION", "ENGINE RB VIBRATION", "COOLER DE VIBRATION", "COOLER NDE VIBRATION",

    // Node 4
    "ENGINE EXHAUST CYL#1 RB", "ENGINE EXHAUST CYL#2 RB", "ENGINE EXHAUST CYL#3 RB",
    "ENGINE EXHAUST CYL#4 RB", "ENGINE EXHAUST CYL#5 RB",
    "ENGINE EXHAUST CYL#1 LB", "ENGINE EXHAUST CYL#2 LB", "ENGINE EXHAUST CYL#3 LB",
    "ENGINE EXHAUST CYL#4 LB", "ENGINE EXHAUST CYL#5 LB",
    "ENGINE EXHAUST COMMON RB", "ENGINE EXHAUST COMMON LB",
    "AIR MANIFOLD RB TEMP", "AIR MANIFOLD LB TEMP", "ENGINE RPM",

    // Node 5
    "ENGINE OIL SUMP LEVEL LOW", "COMPRESSOR LUBE OIL LEVEL LOW",
    "1ST STG SCRUBBER LSHH", "2ND STG SCRUBBER LSHH",
    "LUBE NO FLOW -FSLL", "IGNITION FAULT", "REMOTE ESD", "EMERGENCY STOP PANEL",
    "Engine Start", "Drv Eqp Rdy", "Run Status", "FAULT STATUS TO CONTROL ROOM",
    "ALARM HORN", "STROBE LIGHT FLASH", "STROBE LIGHT FAULT RED", "ALARM STATUS TO CONTROL ROOM",

    // Node 6
    "ENGINE RPM", "STG1 SUCT PRESSURE", "FINAL DISCH PRESSURE",
    "ENGINE SPEED CONTROL SIGNAL", "RECYCLE CONTROL VALVE",
  ];

  // --- Simulated random data ---
  const values = tags.map((name, i) => {
    const val = Math.random() * 100;
    const state = val > 80 ? "alarm" : val > 60 ? "warning" : "normal";
    const unit = name.includes("PRESS") ? "KG/CM2"
               : name.includes("TEMP") ? "°C"
               : name.includes("VIBRATION") ? "mm/s"
               : name.includes("RPM") ? "RPM"
               : "";
    return {
      tag: `T${i + 1}`,
      name,
      value: val.toFixed(1),
      unit,
      lo: (Math.random() * 10).toFixed(1),
      hi: (90 + Math.random() * 10).toFixed(1),
      state,
      group: name.includes("PRESS") ? "Pres"
            : name.includes("TEMP") ? "Temp"
            : name.includes("VIBRATION") ? "Vibr"
            : name.includes("RPM") ? "Speed"
            : name.includes("FAULT") || name.includes("ALARM") || name.includes("RUN") ? "Discrete"
            : "Other"
    };
  });

  const filtered = tab === "All" ? values : values.filter((v) => v.group === tab);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white overflow-hidden">
      {/* Toolbar */}
      <div className="w-[1300px] bg-black">
        <ValuesToolbar currentTab={tab} setTab={setTab} />
      </div>

      {/* Fixed Window same as Dashboard */}
      <div className="w-[1300px] h-[700px] bg-[#111] border border-gray-700 rounded-lg shadow-md flex flex-col overflow-hidden">
        {/* Scrollable Value Grid */}
        <div className="flex-1 overflow-auto p-2 grid grid-cols-5 gap-[6px] justify-items-center">
          {filtered.map((v, i) => (
            <ValueTile key={i} {...v} />
          ))}
        </div>
      </div>
    </div>
  );
}
