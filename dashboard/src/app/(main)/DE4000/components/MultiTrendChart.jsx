"use client";

import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = ["#00FF00", "#FF0000", "#00BFFF", "#FFFF00", "#FFA500", "#00FFFF", "#FF00FF"];

// Base values for each tag (more realistic pressure/temp etc.)
const BASE_VALUES = {
  "STG1 SUC PRESSURE": 15,
  "STG2 DISCH PRESSURE": 65,
  "ENGINE LUBE OIL PRESS": 80,
  "FUEL GAS INLET PRESS": 45,
  "FINAL DISCH PRESSURE": 90,
  "INSTRUMENT AIR PRESS": 8,
};

export default function MultiTrendChart({ selectedTags }) {
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrendData((prev) => {
        const newPoint = {
          time: new Date().toLocaleTimeString([], {
            minute: "2-digit",
            second: "2-digit",
          }),
          values: selectedTags.reduce((acc, tag) => {
            // Get previous value or start near base
            const prevVal =
              prev.length > 0 && prev[prev.length - 1].values[tag] !== undefined
                ? prev[prev.length - 1].values[tag]
                : BASE_VALUES[tag] ?? Math.random() * 100;

            // Small random drift (±2%)
            const drift = (Math.random() - 0.5) * 0.4 * (BASE_VALUES[tag] ?? 50) / 50;
            const newVal = Math.max(0, prevVal + drift);

            acc[tag] = newVal;
            return acc;
          }, {}),
        };

        return [...prev.slice(-60), newPoint]; // Keep last 60 points
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTags]);

  const labels = trendData.map((d) => d.time);
  const datasets = selectedTags.map((tag, i) => ({
    label: tag,
    data: trendData.map((d) => d.values[tag]),
    borderColor: COLORS[i % COLORS.length],
    borderWidth: 2,
    pointRadius: 0,
    tension: 0.3,
  }));

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#fff",
          font: { size: 10 },
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#222",
        titleColor: "#fff",
        bodyColor: "#ddd",
      },
    },
    scales: {
      x: {
        ticks: { color: "#888", font: { size: 9 } },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "#aaa", font: { size: 9 } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Line data={data} options={options} />
    </div>
  );
}
