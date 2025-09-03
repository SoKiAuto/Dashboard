"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import axios from "axios";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function TrendChart({ theme = "light" }) {
  const containerRef = useRef(null);
  const [hidden, setHidden] = useState({});
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default metrics for cylinder 1 suction & discharge
  const defaultMetrics = [
    { label: "Cylinder 1 Suction PSI", path: "cylinders.cylinder_1.head_end.Suction_PSI" },
    { label: "Cylinder 1 Discharge PSI", path: "cylinders.cylinder_1.head_end.Discharge_PSI" },
  ];

  useEffect(() => {
    setMounted(true);
    fetchDefaultData();
  }, []);

  // Fetch default data for last 1 hour
  const fetchDefaultData = async () => {
    try {
      setLoading(true);
      const end = new Date();
      const start = new Date(end.getTime() - 60 * 60 * 1000); // last 1 hour

      const response = await axios.post("/api/cpm/trends", {
        level: "cylinder",
        start,
        end,
        interval: "5m",
        metrics: defaultMetrics,
      });

      setData(response.data || []);
    } catch (error) {
      console.error("❌ Trend data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Derive series keys dynamically
  const { seriesKeys } = useMemo(() => {
    const keys = new Set();
    (data || []).forEach((r) => {
      Object.keys(r || {}).forEach((k) => {
        if (k !== "timestamp") keys.add(k);
      });
    });
    return { seriesKeys: Array.from(keys) };
  }, [data]);

  const toggleKey = (metric) => {
    setHidden((prev) => ({ ...prev, [metric]: !prev[metric] }));
  };

  // Export CSV
  const exportCSV = () => {
    if (!data?.length) return;
    const headers = ["timestamp", ...seriesKeys].join(",");
    const rows = data.map((r) =>
      [r.timestamp, ...seriesKeys.map((k) => (r[k] != null ? r[k] : ""))].join(",")
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

  // Export PNG
  const exportPNG = async () => {
    const el = containerRef.current;
    if (!el) return;
    const canvas = await html2canvas(el);
    const link = document.createElement("a");
    link.download = "cpm-trends.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="bg-card text-card-foreground rounded-2xl shadow p-4 h-[520px] flex items-center justify-center text-muted-foreground">
        Loading trends...
      </div>
    );
  }

  if (!data || !data.length) {
    return (
      <div className="bg-card text-card-foreground rounded-2xl shadow p-4 h-[520px] flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  // Prepare chart series
  const series = seriesKeys
    .filter((k) => !hidden[k])
    .map((k) => ({
      name: k,
      data: data.map((d) => [
        new Date(d.timestamp).getTime(),
        d[k] == null ? null : Number(d[k]),
      ]),
    }));

  const colors = seriesKeys.map((_, i) => `hsl(${(i * 57) % 360} 80% 55%)`);

  // ApexCharts options with dark mode compatibility
  const chartOptions = {
    chart: {
      type: "line",
      height: 520,
      background: "transparent",
      foreColor: theme === "dark" ? "#E5E7EB" : "#1F2937",
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
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 3, strokeWidth: 2, hover: { size: 6 } },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        style: {
          colors: theme === "dark" ? "#E5E7EB" : "#374151",
        },
      },
      tickAmount: Math.min(10, Math.max(4, Math.floor((data.length || 1) / 5))),
    },
    yaxis: {
      decimalsInFloat: 1,
      labels: {
        style: {
          colors: theme === "dark" ? "#E5E7EB" : "#374151",
        },
        formatter: (val) => (val == null ? "" : Number(val).toFixed(1)),
      },
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      labels: {
        colors: theme === "dark" ? "#E5E7EB" : "#374151",
      },
    },
    tooltip: {
      shared: true,
      theme: theme === "dark" ? "dark" : "light",
      x: { format: "dd MMM yyyy HH:mm:ss" },
      y: {
        formatter: (val) => (val == null ? "" : Number(val).toFixed(2)),
      },
    },
    grid: {
      borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
    },
    colors,
  };

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
        <Chart options={chartOptions} series={series} type="line" height={520} />
      </div>

      {/* Legend with toggle chips */}
      <div className="flex flex-wrap gap-2 pt-3">
        {seriesKeys.map((k, i) => {
          const isHidden = !!hidden[k];
          const color = `hsl(${(i * 57) % 360} 80% 55%)`;
          return (
            <button
              key={k}
              onClick={() => toggleKey(k)}
              className={`px-3 py-1 rounded text-xs font-medium border transition flex items-center gap-2 ${
                isHidden ? "opacity-50" : ""
              }`}
              style={{
                borderColor: color,
                color: theme === "dark" ? "#fff" : color,
                backgroundColor: theme === "dark" ? `${color}22` : `${color}15`,
              }}
              title={k}
            >
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ background: color }}
              />
              {isHidden ? `Show ${k}` : `Hide ${k}`}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
