"use client";

import AnalogTopSemiGauge from "../components/Cards/AnalogRadialCard";
import DiscreteChannelCard from "../components/Cards/DiscreteChannelCard";

const gaugeData = [
  { label: "Oil Pressure", value: 28, unit: "bar", range: { min: 0, max: 100 }, warningSetpoint: 70, alarmSetpoint: 90 },
  { label: "Exhaust Temp", value: 120, unit: "°C", range: { min: 0, max: 200 }, warningSetpoint: 150, alarmSetpoint: 180 },
];

const discreteData = [
  { tag: "Emergency Stop", state: false },
  { tag: "Panel Door Open", state: false },
  { tag: "Vibration Alarm", state: true },
];

export default function Node2() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-10 overflow-hidden">
      <div className="flex flex-wrap justify-center gap-8">
        {gaugeData.map((g, i) => (
          <AnalogTopSemiGauge key={i} {...g} />
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {discreteData.map((io, i) => (
          <DiscreteChannelCard key={i} name={io.tag} state={io.state} />
        ))}
      </div>
    </div>
  );
}
