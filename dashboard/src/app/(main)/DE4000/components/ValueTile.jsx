"use client";

export default function ValueTile({
  tag = "PT-0001",
  name = "SENSOR NAME",
  value = 0,
  unit = "",
  lo = 0,
  hi = 100,
  state = "normal",
}) {
  const stateColors = {
    normal: {
      bg: "bg-white text-black border-gray-400",
      line: "border-gray-300",
    },
    warning: {
      bg: "bg-yellow-300 text-black border-yellow-600",
      line: "border-yellow-600",
    },
    alarm: {
      bg: "bg-red-500 text-white border-red-700",
      line: "border-red-700",
    },
  };

  const colors = stateColors[state];

  return (
    <div className="flex flex-col border-2 border-gray-400 rounded-[8px] w-[240px] h-[72px] overflow-hidden shadow-[0_0_2px_rgba(0,0,0,0.3)] bg-[#f5f5f5]">
      {/* Header (always gray, unaffected by state) */}
      <div className="flex justify-between items-center text-[11px] font-semibold px-1 bg-[#c0c0c0] text-[#000] leading-tight">
        <span className="truncate max-w-[120px]">{name}</span>
        <span>{tag}</span>
      </div>

      {/* Value + Lo/Hi section */}
      <div className={`flex-1 flex flex-col justify-between border-t ${colors.line} ${colors.bg}`}>
        {/* Value */}
        <div className="flex items-center justify-center font-bold leading-none py-[10px]">
          <span className="text-[20px]">{value}</span>
          {unit && (
            <span className="text-[12px] font-semibold ml-[4px] opacity-90">{unit}</span>
          )}
        </div>

        {/* Separator line between Value and Lo/Hi */}
        <div className={`border-t ${colors.line}`} />

        {/* Lo/Hi */}
        <div className="flex justify-between text-[10px] px-1 pb-[1px] font-semibold leading-none">
          <span>Lo: {lo}</span>
          <span>Hi: {hi}</span>
        </div>
      </div>
    </div>
  );
}
