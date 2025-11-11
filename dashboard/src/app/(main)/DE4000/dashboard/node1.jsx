"use client";

import AnalogTopSemiGauge from "../components/Cards/AnalogRadialCard";
import DiscreteChannelCard from "../components/Cards/DiscreteChannelCard";

const gaugeData = [
  {
    label: "1st Stage Pressure",
    value: 35,
    unit: "bar",
    range: { min: 0, max: 100 },
    warningSetpoint: 70,
    alarmSetpoint: 90,
  },
  {
    label: "2nd Stage Pressure",
    value: 65,
    unit: "bar",
    range: { min: 0, max: 100 },
    warningSetpoint: 60,
    alarmSetpoint: 80,
  },
  {
    label: "Tank Level",
    value: 82,
    unit: "%",
    range: { min: 0, max: 100 },
    warningSetpoint: 75,
    alarmSetpoint: 90,
  },
  {
    label: "RPM",
    value: 1450,
    unit: "rpm",
    range: { min: 0, max: 2000 },
    warningSetpoint: 1700,
    alarmSetpoint: 1900,
  },
];

// 🔹 All discrete examples (each with different type)
const discreteData = [
  { name: "Fuel", state: true },
  { name: "Ignition", state: false },
  { name: "Crank", state: true },
  { name: "PreLube", state: false },
  { name: "System Ready", state: true }, // falls to "other" color
  { name: "Compressor Run", state: false },
  { name: "Trip", state: false },
];

export default function Node1() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-10 overflow-hidden">
      {/* Gauges Section */}
      <div className="flex flex-wrap justify-center gap-8">
        {gaugeData.map((g, i) => (
          <AnalogTopSemiGauge key={i} {...g} />
        ))}
      </div>

      {/* Discrete Cards Section */}
      <div className="flex flex-wrap justify-center gap-4">
        {discreteData.map((io, i) => (
          <DiscreteChannelCard key={i} name={io.name} state={io.state} />
        ))}
      </div>
    </div>
  );
}
