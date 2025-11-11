"use client";

export default function DiscreteChannelCard({ name, state }) {
  const isOn = state === true || state === "ON" || state === "On" || state === 1;

  // ✅ Determine background color from name
  const nameLower = name?.toLowerCase() || "";
  let bgColor = "#848484"; // default gray

  if (nameLower.includes("fuel")) {
    bgColor = "#2596be"; // blue
  } else if (nameLower.includes("ignition")) {
    bgColor = "#bebe63"; // yellowish
  } else if (nameLower.includes("crank")) {
    bgColor = "#de8e33"; // orange
  } else if (nameLower.includes("prelube") || nameLower.includes("pre lube")) {
    bgColor = "#8c42e5"; // purple
  }

  return (
    <div
      className="
        flex items-center justify-between
        w-64 px-2 py-3 rounded-lg
        shadow-lg border
        transition-all duration-300 transform
        hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(0,0,0,0.25)]
      "
      style={{
        background: `linear-gradient(to bottom, ${bgColor}, ${bgColor}cc)`,
        borderColor: "#222",
        color: "#000",
      }}
    >
      {/* Left: Tag Name */}
      <span className="text-base font-semibold truncate tracking-wide">
        {name}
      </span>

      {/* Right: Status Circle */}
      <div
        className={`
          h-8 w-8  rounded-full border-[1.5px]
          transition-all duration-300
          ${isOn
            ? "bg-green-500 border-green-300 shadow-[0_0_10px_3px_rgba(34,197,94,0.6)]"
            : "bg-[#111] border-gray-500 shadow-[inset_0_0_6px_rgba(255,255,255,0.15)]"}
        `}
        style={{
          boxShadow: isOn
            ? "0 0 15px 3px rgba(34,197,94,0.7)"
            : "inset 0 0 6px rgba(255,255,255,0.1)",
        }}
      />
    </div>
  );
}
