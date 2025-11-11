"use client";

export default function AnalogLabelCard({
  label = "Analog Label",
  value = 0,
  color = "#e0e0e0", // mild gray header color
}) {
  return (
    <div
      className="flex flex-col w-74 bg-[#f5f5f5] border-2 border-black rounded-md shadow-md"
      style={{
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        overflow: "hidden",
      }}
    >
      {/* Label Header */}
      <div
        className="w-full text-center px-3 py-2 font-bold"
        style={{
          backgroundColor: color,
          color: "#000",
          fontSize: "18px",
          fontWeight: 700,
          lineHeight: "1.2",
        }}
      >
        {label}
      </div>

      {/* Value Section */}
      <div
        className="flex items-center justify-end w-full bg-white"
        style={{
          fontFamily: "Calibri, Segoe UI, sans-serif",
          padding: "2px 14px", // smaller padding for compact look
          height: "44px", // consistent card height
        }}
      >
        <span
          className="font-extrabold text-[#172C51]"
          style={{
            fontSize: "44px",
            lineHeight: "1",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
