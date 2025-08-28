"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BatteryWarning, Zap, CheckCircle } from "lucide-react";

export default function BiasOutliers() {
  const [outliers, setOutliers] = useState([]);

  useEffect(() => {
    const fetchBias = async () => {
      try {
        const res = await fetch("/api/vm/live");
        const data = await res.json();

        const biasList = data
          .filter(
            (d) =>
              d.channel >= 1 &&
              d.channel <= 8 &&
              typeof d.values?.Bias_Voltage === "number"
          )
          .map((d) => ({
            channel: d.channel,
            value: d.values.Bias_Voltage,
          }))
          .filter((d) => d.value < 1.0 || d.value > 4.5);

        setOutliers(biasList);
      } catch (err) {
        console.error("Failed to fetch bias voltage:", err);
      }
    };

    fetchBias();
    const interval = setInterval(fetchBias, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSeverity = (val) => {
    if (val < 1.0) return "low";
    if (val > 4.5) return "high";
    return "normal";
  };

  const getColor = (severity) => {
    switch (severity) {
      case "low":
        return "bg-red-900 text-red-200";
      case "high":
        return "bg-yellow-900 text-yellow-200";
      default:
        return "bg-green-900 text-green-200";
    }
  };

  const getFillPercent = (val) => {
    const min = 0;
    const max = 5;
    return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-semibold tracking-wide">
          Bias Voltage Outliers
        </h2>
      </div>

      {outliers.length === 0 ? (
        <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">All channels normal</span>
        </div>
      ) : (
        <div className="space-y-3">
          {outliers.map(({ channel, value }) => {
            const severity = getSeverity(value);
            const color = getColor(severity);
            const fill = getFillPercent(value);

            return (
              <Link key={channel} href={`/vm/${channel}`} className="block">
                <div
                  className={`rounded-lg px-3 py-2 ${color} shadow flex items-center justify-between hover:scale-[1.02] transition-transform`}
                >
                  <div className="flex items-center gap-2">
                    <BatteryWarning className="w-4 h-4" />
                    <span className="font-medium">Ch {channel}</span>
                  </div>
                  <div className="flex-1 mx-4 h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/80 rounded-full"
                      style={{ width: `${fill}%` }}
                    ></div>
                  </div>
                  <div className="font-mono text-sm">{value.toFixed(2)} V</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
