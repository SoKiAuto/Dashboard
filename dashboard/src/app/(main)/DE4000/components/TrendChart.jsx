"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

export default function TrendChart({ name, unit }) {
  const [dataPoints, setDataPoints] = useState([]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const newVal = Math.random() * 100;
        const newData = [...prev, { time: new Date().toLocaleTimeString(), value: newVal }];
        return newData.slice(-30); // keep 30 points
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: dataPoints.map((d) => d.time),
    datasets: [
      {
        label: `${name} (${unit})`,
        data: dataPoints.map((d) => d.value),
        borderColor: "#36a2eb",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#999", font: { size: 9 } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: "#999", font: { size: 10 } },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
    plugins: {
      legend: {
        labels: { color: "#BDB8AE", font: { size: 10 } },
      },
    },
  };

  return (
    <div className="bg-[#111] border border-gray-700 rounded-md shadow-md h-[250px] p-2 flex flex-col">
      <h3 className="text-[12px] font-semibold text-gray-300 text-center mb-1 truncate">
        {name}
      </h3>
      <div className="flex-1">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
