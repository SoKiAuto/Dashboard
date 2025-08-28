"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function CylinderCharts({ cylinder }) {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/cpm/history?cylinder=${cylinder}`);
      const json = await res.json();
      setHistory(json || []);
    } catch (err) {
      console.error("❌ Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [cylinder]);

  // ✅ Normalize cylinder key
  const cylKey = cylinder.startsWith("cylinder_")
    ? cylinder
    : `cylinder_${cylinder}`;

  // ✅ Time labels
  const timestamps = history.map((h) =>
    new Date(h.timestamp).toLocaleTimeString()
  );

  // ✅ Extract correct data
  const discPress = history.map(
    (h) => h.values?.cylinders?.[cylKey]?.head_end?.Discharge_Pressure_psi || 0
  );
  const suctPress = history.map(
    (h) => h.values?.cylinders?.[cylKey]?.head_end?.Suction_Pressure_psi || 0
  );

  const hpHE = history.map(
    (h) => h.values?.cylinders?.[cylKey]?.head_end?.HP || 0
  );
  const hpCE = history.map(
    (h) => h.values?.cylinders?.[cylKey]?.crank_end?.HP || 0
  );

  // ✅ Latest values for gauges
  const latestDisc = discPress[discPress.length - 1] || 0;
  const latestSuct = suctPress[suctPress.length - 1] || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 p-6 gap-6 rounded-2xl shadow-lg border border-border bg-card">
      {/* Left Side → Dual Semi Gauges */}
      <Card className="p-6 rounded-2xl shadow-lg border border-border bg-card relative">
        {/* Top-right live values */}
        <div className="absolute top-4 right-4 text-sm space-y-1 text-right">
          <div className="font-semibold" style={{ color: "var(--chart-1)" }}>
            Discharge: {latestDisc.toFixed(1)} psi
          </div>
          <div className="font-semibold" style={{ color: "var(--chart-2)" }}>
            Suction: {latestSuct.toFixed(1)} psi
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2 text-center">
          Discharge vs Suction Pressure
        </h3>
        <Chart
          options={{
            chart: {
              type: "radialBar",
              sparkline: { enabled: true },
            },
            plotOptions: {
              radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: {
                  size: "45%", // Keep gauge BIG
                },
                track: {
                  background: "var(--color-muted)",
                  strokeWidth: "100%",
                },
                dataLabels: {
                  name: {
                    show: true,
                    fontSize: "14px",
                    color: "var(--color-foreground)",
                    offsetY: 35, // Reduce bottom gap more
                  },
                  value: {
                    show: true,
                    fontSize: "20px",
                    fontWeight: "bold",
                    offsetY: -20,
                    formatter: (val, opts) =>
                      opts.seriesIndex === 0
                        ? `${latestDisc.toFixed(1)} psi`
                        : `${latestSuct.toFixed(1)} psi`,
                  },
                },
              },
            },
            colors: ["var(--chart-1)", "var(--chart-2)"],
            labels: ["Discharge", "Suction"],
            legend: {
              show: true,
              position: "bottom",
              fontSize: "14px",
              labels: { colors: "var(--color-foreground)" },
              markers: { width: 14, height: 14, radius: 4 },
              offsetY: -220, // Reduced gap further
            },
            tooltip: { enabled: false }, // We already show live values
          }}
          series={[
            Math.min((latestDisc / 500) * 100, 100),
            Math.min((latestSuct / 300) * 100, 100),
          ]}
          type="radialBar"
          height={550} // Large, visible gauge
        />
      </Card>

      {/* Right Side → HP Trend */}
      <Card className="p-6 rounded-2xl shadow-lg border border-border bg-card">
        <h3 className="text-lg font-semibold mb-6 text-center">
          HP Trend (HE vs CE)
        </h3>
        <Chart
          options={{
            chart: {
              type: "area",
              toolbar: { show: false },
              zoom: { enabled: true },
            },
            stroke: { curve: "smooth", width: 4 },
            dataLabels: { enabled: false },
            grid: {
              borderColor: "var(--color-border)",
              strokeDashArray: 4,
            },
            xaxis: {
              categories: timestamps,
              labels: {
                style: {
                  colors: "var(--color-muted-foreground)",
                  fontSize: "11px",
                },
              },
            },
            yaxis: {
              min: 0,
             max:
                Math.max(0, ...hpHE, ...hpCE) < 100
                    ? 200
                    : Math.max(0, ...hpHE, ...hpCE) * 1.2,

              forceNiceScale: true,
              title: {
                text: "Horsepower",
                style: { color: "var(--color-foreground)" },
              },
              labels: {
                style: { colors: "var(--color-foreground)" },
              },
            },
            colors: ["var(--chart-3)", "var(--chart-4)"],
            fill: {
              type: "gradient",
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.6,
                opacityTo: 0,
                stops: [0, 90, 100],
              },
            },
            tooltip: {
              shared: true,
              intersect: false,
              theme: "dark",
              y: { formatter: (val) => `${val} HP` },
            },
            legend: {
              position: "top",
              horizontalAlign: "right",
              labels: { colors: "var(--color-foreground)" },
              markers: { width: 14, height: 14, radius: 4 },
            },
          }}
          series={[
            { name: "Head End HP", data: hpHE },
            { name: "Crank End HP", data: hpCE },
          ]}
          type="area"
          height={300}
        />
      </Card>
    </div>
  );
}
