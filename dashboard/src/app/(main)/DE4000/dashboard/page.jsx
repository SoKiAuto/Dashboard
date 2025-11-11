"use client";

import React, { useState } from "react";
import Node1 from "./node1";
import Node2 from "./node2";
import { ChevronLeft, ChevronRight } from "lucide-react";

const nodes = [Node1, Node2]; // Add more nodes later

export default function DE4000DashboardPage() {
  const [currentNode, setCurrentNode] = useState(0);
  const CurrentNodeComponent = nodes[currentNode];

  return (
    <div className="relative w-full h-full flex flex-col bg-black text-[#BDB8AE] overflow-hidden">
      {/* 🔹 Header Bar */}
      <div className="flex justify-between items-center px-6 py-31 border-b border-gray-700">
        {/* Left: Dashboard Title */}
        <h1 className="text-lg font-semibold text-white">
          DE4000 Dashboard
        </h1>

        {/* Center: Node Indicators */}
        <div className="flex gap-3 items-center">
          {nodes.map((_, index) => (
            <div
              key={index}
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold border transition-all duration-200 ${
                currentNode === index
                  ? "bg-[#25458C] text-white border-[#25458C]"
                  : "bg-transparent text-gray-500 border-gray-600"
              }`}
            >
              {currentNode === index ? `${index + 1}/${nodes.length}` : ""}
            </div>
          ))}
        </div>

        {/* Right: Navigation Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentNode((p) => Math.max(p - 1, 0))}
            disabled={currentNode === 0}
            className={`p-2 rounded-md flex items-center justify-center ${
              currentNode === 0
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[#25458C] text-white hover:bg-[#3667b1]"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() =>
              setCurrentNode((p) => Math.min(p + 1, nodes.length - 1))
            }
            disabled={currentNode === nodes.length - 1}
            className={`p-2 rounded-md flex items-center justify-center ${
              currentNode === nodes.length - 1
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[#25458C] text-white hover:bg-[#3667b1]"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 🔹 Fixed Dashboard Window */}
      <div className="flex-1 flex justify-center items-center overflow-hidden">
        <div
          className="
            w-[1300px]
            h-[700px]
            bg-[#111]
            border border-gray-700
            rounded-lg
            shadow-md
            flex justify-center items-center
          "
        >
          <CurrentNodeComponent />
        </div>
      </div>
    </div>
  );
}
