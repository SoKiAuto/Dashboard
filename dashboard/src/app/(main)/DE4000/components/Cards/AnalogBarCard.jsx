"use client";

export default function AnalogBarCard({
  label = "Analog Label",
  value = 0,
  min = 0,
  max = 100,
  warningSetpoint = 70, // H
  alarmSetpoint = 90, // HH
  color = "#e0e0e0", // header background
  barColor = "#2596be", // default bar color
}) {
  // Percentage of value position
  const percent = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const warnPercent = ((warningSetpoint - min) / (max - min)) * 100;
  const alarmPercent = ((alarmSetpoint - min) / (max - min)) * 100;

  return (
    <div
      className="flex flex-col w-74 bg-[#f5f5f5] border-2 border-black rounded-md shadow-md"
      style={{
        boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
        overflow: "hidden",
        height: "140px", // smaller overall height
      }}
    >
      {/* Scale Section */}
      <div
        className="relative flex justify-between text-xs font-semibold px-3 mt-1"
        style={{
          color: "#000",
          fontFamily: "Calibri, Segoe UI, sans-serif",
        }}
      >
        <span>{min}</span>
        <span>{max}</span>

        {/* H Marker */}
        <span
          className="absolute -top-1"
          style={{
            left: `${warnPercent}%`,
            transform: "translateX(-50%)",
            color: "orange",
            fontWeight: 700,
          }}
        >
          H
        </span>

        {/* HH Marker */}
        <span
          className="absolute -top-1"
          style={{
            left: `${alarmPercent}%`,
            transform: "translateX(-50%)",
            color: "red",
            fontWeight: 700,
          }}
        >
          HH
        </span>
      </div>

      {/* Horizontal Bar */}
      <div className="relative w-full h-3 bg-gray-300 mt-1 mx-auto">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: barColor,
          }}
        ></div>
      </div>

      {/* Label Header */}
      <div
        className="w-full text-center px-3 py-1 font-bold"
        style={{
          backgroundColor: color,
          color: "#000",
          fontSize: "16px",
          fontWeight: 700,
          lineHeight: "1.1",
          marginTop: "6px",
        }}
      >
        {label}
      </div>

      {/* Value Section */}
      <div
        className="flex items-center justify-end w-full bg-white"
        style={{
          fontFamily: "Calibri, Segoe UI, sans-serif",
          padding: "2px 14px",
          height: "36px", // smaller section
        }}
      >
        <span
          className="font-extrabold text-[#172C51]"
          style={{
            fontSize: "36px",
            lineHeight: "1",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
