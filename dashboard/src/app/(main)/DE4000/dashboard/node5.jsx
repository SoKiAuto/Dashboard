"use client";

import DiscreteChannelCard from "../components/Cards/DiscreteChannelCard";

export default function Node5() {
  const rows = [
    [
      "ENGINE OIL SUMP LEVEL LOW",
      "COMPRESSOR LUBE OIL LEVEL LOW",
      "1ST STG SCRUBBER LSHH",
      "2ND STG SCRUBBER LSHH",
    ],
    ["LUBE NO FLOW -FSLL", "IGNITION FAULT"],
    ["REMOTE ESD", "EMERGENCY STOP PANEL"],
    ["Engine Start", "Drv Eqp Rdy", "Run Status", "FAULT STATUS TO CONTROL ROOM"],
    ["ALARM HORN", "STROBE LIGHT FLASH", "STROBE LIGHT FAULT RED", "ALARM STATUS TO CONTROL ROOM"],
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      {rows.map((tags, i) => (
        <div key={i} className="flex flex-wrap justify-center gap-4">
          {tags.map((name, j) => (
            <DiscreteChannelCard key={j} name={name} state={Math.random() > 0.5} />
          ))}
        </div>
      ))}
    </div>
  );
}
