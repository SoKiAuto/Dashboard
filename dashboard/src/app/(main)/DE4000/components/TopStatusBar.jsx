"use client";

import { ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";

const modules = [
  { id: 1, connected: true },
  { id: 2, connected: true },
  { id: 3, connected: true },
  { id: 4, connected: false },
  { id: 5, connected: false },
];

export default function TopStatusBar() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-8 w-full bg-[#212121] text-[#BDB8AE] flex items-center justify-between px-4 text-sm">
      {/* Left Empty for Spacing */}
      <div className="w-1/3"></div>

      {/* Center: Project Box */}
      <div className="flex-1 flex justify-center">
        <div className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-sm tracking-wide shadow-sm border border-[#333]">
          ID: HP-1200
        </div>
      </div>

      {/* Right Side: Modules, Date, Time */}
      <div className="w-1/3 flex items-center justify-end space-x-4">
        {/* Connectivity */}
        <div className="flex items-center space-x-2">
          {/* Overall Connectivity Icon */}
          <ArrowUpDown className="h-4 w-4 text-green-500" />

          {/* Individual Modules */}
          <div className="flex items-center space-x-1">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className={`h-4 w-4 flex items-center justify-center rounded-sm text-[12px] font-semibold ${
                  mod.connected ? "bg-green-500 text-black" : "bg-gray-500 text-[#000000]"
                }`}
              >
                {mod.id}
              </div>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="text-[#CFCFCF] font-medium">{date}</div>

        {/* Time */}
        <div className="text-[#CFCFCF] font-medium">{time}</div>
      </div>
    </div>
  );
}
