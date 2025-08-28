"use client";
import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import Link from "next/link";

export default function TopRMS() {
  const [topChannels, setTopChannels] = useState([]);

  useEffect(() => {
    const fetchRMS = async () => {
      try {
        const res = await fetch("/api/vm/live");
        const data = await res.json();

        const rmsList = data
          .filter((d) => typeof d.values?.Overall_RMS === "number")
          .map((d) => ({
            channel: d.channel,
            value: d.values.Overall_RMS,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 3);

        setTopChannels(rmsList);
      } catch (err) {
        console.error("Failed to fetch RMS:", err);
      }
    };

    fetchRMS();
    const interval = setInterval(fetchRMS, 3000);
    return () => clearInterval(interval);
  }, []);


const getColorByRank = (rank) => {
  const colors = [
    "bg-[#3b0000]", // Darkest Red
    "bg-[#4a1a00]", // Darkest Orange
    "bg-[#4a3900]", // Darkest Yellow
  ];
  return colors[rank];
};





  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        <Flame className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Top 3 High RMS Channels
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {topChannels.map((item, index) => {
          const color = getColorByRank(index);
          return (
            <Link key={item.channel} href={`/vm/${item.channel}`}>
              <div
                className={`rounded-xl text-white shadow-md transition-transform transform hover:scale-105 cursor-pointer ${color} flex flex-col items-center justify-center py-6`}
              >
                <span className="text-3xl font-bold">{item.value.toFixed(2)}</span>
                <span className="text-sm mt-1 opacity-90">CH-{item.channel}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
