"use client";

import React from "react";
import ReactECharts from "echarts-for-react";

export default function TestChart() {
  const options = {
    title: {
      text: "Apache ECharts Demo",
      left: "center",
      textStyle: {
        color: "#fff"
      }
    },
    tooltip: {
      trigger: "axis"
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: { lineStyle: { color: "#aaa" } },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#aaa" } },
    },
    series: [
      {
        name: "Demo Data",
        type: "line",
        smooth: true,
        data: [150, 230, 224, 218, 135, 147, 260],
        lineStyle: {
          color: "#00f5ff",
          width: 3
        }
      }
    ],
    backgroundColor: "#111827" // Dark mode ready 🌙
  };

  return (
    <div className="p-6">
      <ReactECharts option={options} style={{ height: 400 }} />
    </div>
  );
}
