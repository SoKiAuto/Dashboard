export default function AnalogChannelCard({ name, value, unit, min, max, tag }) {
  // Determine color based on value (example)
  const color =
    value < min + (max - min) * 0.2
      ? "bg-green-500"
      : value > max - (max - min) * 0.2
      ? "bg-red-500"
      : "bg-yellow-500";

  return (
    <div className="p-3 bg-[#212121] text-[#BDB8AE] rounded-md flex flex-col items-center space-y-1 w-20">
      <span className="text-xs">{tag || name}</span>
      <span className={`text-lg font-bold ${color} text-white rounded px-1`}>
        {value} {unit}
      </span>
    </div>
  );
}
