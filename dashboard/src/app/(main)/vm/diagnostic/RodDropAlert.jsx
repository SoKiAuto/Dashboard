"use client";
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function RodDropRMS() {
  const [rodDropChannels, setRodDropChannels] = useState([]);

  useEffect(() => {
    const fetchRMS = async () => {
      try {
        const res = await fetch("/api/vm/live");
        const data = await res.json();

        const filtered = data
          .filter(
            (d) =>
              [9, 10, 11, 12].includes(d.channel) &&
              typeof d.values?.Overall_RMS === "number"
          )
          .map((d) => ({
            channel: d.channel,
            value: d.values.Overall_RMS,
          }))
          .sort((a, b) => b.value - a.value);

        setRodDropChannels(filtered);
      } catch (err) {
        console.error("Failed to fetch Rod Drop RMS:", err);
      }
    };

    fetchRMS();
    const interval = setInterval(fetchRMS, 3000);
    return () => clearInterval(interval);
  }, []);

  const getBarColor = (value) => {
    if (value >= 8) return "bg-[#3b0000]";
    if (value >= 6) return "bg-[#5c1a0a]";
    if (value >= 4) return "bg-[#7a2e0c]";
    if (value >= 2) return "bg-[#a64810]";
    return "bg-[#d16d17]";
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-yellow-400" />
        Rod Drop RMS (Channels 9–12)
      </h2>

      {rodDropChannels.length > 0 ? (
        <div className="space-y-4">
          {rodDropChannels.map((item) => {
            const barWidth = Math.min((item.value / 10) * 100, 100); // normalize to 100%
            const barColor = getBarColor(item.value);

            return (
              <Link key={item.channel} href={`/vm/${item.channel}`}>
                <div className="space-y-1 cursor-pointer hover:opacity-90 transition-opacity">
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>Channel {item.channel}</span>
                    <span>{item.value.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-zinc-300 dark:bg-zinc-700 rounded-full h-4 overflow-hidden">
                    <div
                      className={`${barColor} h-4 transition-all`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          All Rod Drop channels normal
        </p>
      )}
    </div>
  );
}
