"use client";

import React, { useState } from "react";
import Node1 from "./node1";
import Node2 from "./node2";
import { ChevronLeft, ChevronRight } from "lucide-react";

const nodes = [Node1, Node2];

export default function DE4000DashboardPage() {
  const [currentNode, setCurrentNode] = useState(0);
  const CurrentNodeComponent = nodes[currentNode];

  return (
    <div className="relative w-full h-full flex flex-col bg-black text-[#BDB8AE] overflow-hidden">
      {/* Header Bar (for Node Switching) */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-gray-700">
        <h1 className="text-xl font-semibold">
          DE4000 Dashboard — Node {currentNode + 1} / {nodes.length}
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentNode((p) => Math.max(p - 1, 0))}
            disabled={currentNode === 0}
            className={`px-4 py-2 rounded-md flex items-center gap-1 ${
              currentNode === 0
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[#25458C] text-white hover:bg-[#3667b1]"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <button
            onClick={() =>
              setCurrentNode((p) => Math.min(p + 1, nodes.length - 1))
            }
            disabled={currentNode === nodes.length - 1}
            className={`px-4 py-2 rounded-md flex items-center gap-1 ${
              currentNode === nodes.length - 1
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[#25458C] text-white hover:bg-[#3667b1]"
            }`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Window Area */}
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
