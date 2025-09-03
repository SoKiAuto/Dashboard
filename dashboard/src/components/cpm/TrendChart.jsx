"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function TrendChart({ data, theme = "light" }) {
  const containerRef = useRef(null);
  const [hidden, setHidden] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { chartData, seriesMap } = useMemo(() => {
    // Check if data is a valid object with 'data' and 'seriesMap' properties
    if (!data || !data.data || !data.seriesMap) {
      return { chartData: [], seriesMap: {} };
    }
    return { chartData: data.data, seriesMap: data.seriesMap };
  }, [data]);

  const seriesKeys = useMemo(() => Object.keys(seriesMap), [seriesMap]);

  const toggleKey = (metricPath) => {
    setHidden((prev) => ({ ...prev, [metricPath]: !prev[metricPath] }));
  };

  const exportCSV = () => {
    if (!chartData?.length) return;
    const headers = ["timestamp", ...seriesKeys.map((k) => seriesMap[k] || k)].join(",");
    const rows = chartData.map((r) =>
      [r.timestamp, ...seriesKeys.map((k) => r[k] ?? "")].join(",")
    );
    const blob = new Blob([headers + "\n" + rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cpm-trends.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = async () => {
    const el = containerRef.current;
    if (!el) return;
    const canvas = await html2canvas(el);
    const link = document.createElement("a");
    link.download = "cpm-trends.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-2xl shadow p-4 h-[520px] flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  const series = seriesKeys
    .filter((k) => !hidden[k])
    .map((k) => ({
      name: seriesMap[k] || k, // Use the friendly label
      data: chartData.map((d) => [new Date(d.timestamp).getTime(), d[k]]),
    }));

  const chartOptions = {
    chart: {
      type: "line",
      height: 520,
      zoom: { enabled: true, type: "x" },
      toolbar: {
        show: true,
        tools: {
          download: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: { size: 0 },
    xaxis: {
      type: "datetime",
      labels: { format: "HH:mm:ss" },
    },
    yaxis: {
      decimalsInFloat: 2,
      labels: {
        formatter: (val) => val.toFixed(2),
      },
    },
    legend: {
      show: false, // We use a custom legend below the chart
    },
    tooltip: {
      shared: true,
      theme: theme === "dark" ? "dark" : "light",
      x: { format: "dd MMM yyyy HH:mm:ss" },
      y: {
        formatter: (val) => val.toFixed(2),
      },
    },
    grid: {
      borderColor: theme === "dark" ? "#333" : "#e5e5e5",
    },
    colors: seriesKeys.map((_, i) => `hsl(${(i * 57) % 360} 80% 45%)`),
  };

  if (!mounted) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card text-card-foreground rounded-2xl shadow p-4 space-y-3"
    >
      {/* Export Buttons */}
      <div className="flex gap-2 justify-end">
        <button
          className="px-3 py-1 border rounded hover:bg-accent transition"
          onClick={exportCSV}
        >
          Export CSV
        </button>
        <button
          className="px-3 py-1 border rounded hover:bg-accent transition"
          onClick={exportPNG}
        >
          Export PNG
        </button>
      </div>

      {/* ApexCharts */}
      <div className="h-[520px]">
        <Chart
          options={chartOptions}
          series={series}
          type="line"
          height={520}
        />
      </div>

      {/* Legend with toggle */}
      <div className="flex flex-wrap gap-2 pt-3">
        {seriesKeys.map((k, i) => (
          <button
            key={k}
            onClick={() => toggleKey(k)}
            className={`px-3 py-1 rounded text-xs font-medium border transition ${
              hidden[k] ? "opacity-50" : ""
            }`}
            style={{
              borderColor: `hsl(${(i * 57) % 360} 80% 45%)`,
              color: `hsl(${(i * 57) % 360} 80% 45%)`,
            }}
          >
            {hidden[k] ? `Show ${seriesMap[k] || k}` : `${seriesMap[k] || k}`}
          </button>
        ))}
      </div>
    </motion.div>
  );
}