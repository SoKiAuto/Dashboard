"use client";

export default function DiscreteChannelCard({ name, state }) {
  const isOn = state === true || state === "ON" || state === "On" || state === 1;

  return (
    <div className="flex items-center justify-between w-64 px-4 py-3 bg-[#212121] text-[#BDB8AE] rounded-md shadow-md border border-[#333]">
      {/* Left: Tag Name */}
      <span className="text-sm font-medium truncate">{name}</span>

      {/* Right: Status Circle */}
      <div
        className={`h-5 w-5 rounded-full border-2 transition-all duration-300 ${
          isOn
            ? "bg-green-500 border-green-400 shadow-[0_0_8px_#22c55e]"
            : "bg-black border-gray-600"
        }`}
      />
    </div>
  );
}
