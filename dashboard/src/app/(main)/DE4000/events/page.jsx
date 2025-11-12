"use client";

import React from "react";
import { AlertTriangle, Play, RotateCcw, CheckCircle } from "lucide-react";

// Mock event data
const mockEvents = [
  { id: 1, type: "reset", date: "02/27/2025", time: "18:43:59", message: "System Reset" },
  { id: 2, type: "fault", date: "02/27/2025", time: "18:43:58", message: "Fault Manual Stop" },
  { id: 3, type: "start", date: "02/27/2025", time: "18:43:43", message: "System Start" },
  { id: 4, type: "reset", date: "02/27/2025", time: "18:43:24", message: "System Reset" },
  { id: 5, type: "fault", date: "02/27/2025", time: "18:43:22", message: "Fault High Pressure" },
  { id: 6, type: "start", date: "02/27/2025", time: "18:43:05", message: "Fault Low Pressure" },
  { id: 7, type: "reset", date: "02/27/2025", time: "18:42:59", message: "System Reset" },
];

// Icon + color map
const typeStyles = {
  start: { icon: <Play size={22} className="text-green-500" />, color: "text-green-500" },
  reset: { icon: <RotateCcw size={22} className="text-yellow-500" />, color: "text-yellow-500" },
  fault: { icon: <AlertTriangle size={22} className="text-red-500" />, color: "text-red-500" },
  normal: { icon: <CheckCircle size={22} className="text-gray-400" />, color: "text-gray-400" },
};

export default function DE4000EventsPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white overflow-hidden">
      {/* Fixed Window same as Dashboard */}
      <div className="w-[1300px] h-[700px] bg-[#111] border border-gray-700 rounded-lg shadow-md overflow-y-auto p-6">
        <h1 className="text-xl font-semibold mb-4 text-center text-white">Event Timeline</h1>

        {/* Timeline */}
        <div className="relative border-l border-gray-600 ml-4 pl-6">
          {mockEvents.map((event, i) => {
            const { icon, color } = typeStyles[event.type] || typeStyles.normal;
            return (
              <div key={i} className="mb-6 relative">
                {/* Timeline dot */}
                <div className="absolute -left-[30px] top-[3px] w-[12px] h-[12px] bg-gray-800 border-2 border-gray-600 rounded-full" />

                {/* Icon */}
                <div className="absolute -left-[22px] top-[18px]">
                  {icon}
                </div>

                {/* Event Row */}
                <div className="flex items-center justify-between bg-[#1c1c1c] border border-gray-700 rounded-md px-10 py-2 hover:bg-[#222] transition">
                  {/* Date + Time */}
                  <div className="flex flex-col text-sm text-gray-400 min-w-[160px]">
                    <span>{event.date}</span>
                    <span className="text-gray-300 font-semibold">{event.time}</span>
                  </div>

                  {/* Message */}
                  <div className="text-md font-semibold text-white flex-1 text-left px-4">
                    <span className={`${color}`}>{event.message}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
