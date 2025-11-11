"use client";

import AnalogTopSemiGauge from "../components/Cards/AnalogRadialCard";
import DiscreteChannelCard from "../components/Cards/DiscreteChannelCard";

const gaugeData = [
  { label: "1st Stage Pressure", value: 35, unit: "bar", range: { min: 0, max: 100 }, warningSetpoint: 70, alarmSetpoint: 90 },
  { label: "2nd Stage Pressure", value: 65, unit: "bar", range: { min: 0, max: 100 }, warningSetpoint: 60, alarmSetpoint: 80 },
  { label: "Tank Level", value: 82, unit: "%", range: { min: 0, max: 100 }, warningSetpoint: 75, alarmSetpoint: 90 },
  { label: "Inlet Flow", value: 15, unit: "m³/h", range: { min: 0, max: 50 }, warningSetpoint: 35, alarmSetpoint: 45 },
  { label: "Temperature", value: 55, unit: "°C", range: { min: 0, max: 100 }, warningSetpoint: 60, alarmSetpoint: 80 },
  { label: "RPM", value: 1450, unit: "rpm", range: { min: 0, max: 2000 }, warningSetpoint: 1700, alarmSetpoint: 1900 },
];

const discreteData = [
  { tag: "Compressor Run", state: true },
  { tag: "Compressor Trip", state: false },
  { tag: "System Ready", state: true },
];

export default function Node1() {
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
