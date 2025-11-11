"use client";

import { User, ArrowUpDown } from "lucide-react";



const modules = [
  { id: 1, connected: true },
  { id: 2, connected: true },
  { id: 3, connected: false },
  { id: 4, connected: false },
  { id: 5, connected: false },
];

export default function TopStatusBar() {
  return (
    <div className="h-10 w-full bg-[#212121] text-[#BDB8AE] flex items-center justify-between px-4">
      {/* Left: Admin Info */}
      <div className="flex items-center space-x-4">
        <User className="h-6 w-6" />
        <span className="text-sm font-bold">Admin</span>
      </div>

      {/* Right: Connectivity */}
      <div className="flex items-center space-x-3">
        {/* Overall Connectivity Icon */}
        <div className="flex items-center space-x-0.5">
          <ArrowUpDown className="h-5 w-5  text-green-500"  />
        </div>

        {/* Individual Modules */}
        <div className="flex items-center space-x-1 ">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className={`h-5 w-5 flex items-center justify-center rounded-sm text-[15px] font-semibold ${
                mod.connected ? "bg-green-500 text-black" : "bg-gray-400 text-[#000000]"
              }`}
            >
              {mod.id}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
