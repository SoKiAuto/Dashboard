"use client";

import React, { useState } from "react";
import TrendsToolbar from "../components/TrendsToolbar";
import MultiTrendChart from "../components/MultiTrendChart";

export default function DE4000TrendsPage() {
  const allTags = [
    "STG1 SUC PRESSURE",
    "STG2 DISCH PRESSURE",
    "ENGINE LUBE OIL PRESS",
    "FUEL GAS INLET PRESS",
    "FINAL DISCH PRESSURE",
    "INSTRUMENT AIR PRESS",
  ];

  const [selectedTags, setSelectedTags] = useState(allTags);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white overflow-hidden">
      {/* Toolbar (same width as window) */}
      <div className="w-[1300px] bg-black">
        <TrendsToolbar
          allTags={allTags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
      </div>

      {/* Fixed window exactly same as Dashboard */}
      <div className="w-[1300px] h-[700px] bg-[#111] border border-gray-700 rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="flex-1 w-full h-full">
          <MultiTrendChart selectedTags={selectedTags} />
        </div>
      </div>
    </div>
  );
}
