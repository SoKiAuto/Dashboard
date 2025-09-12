"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendingUp } from "lucide-react";
import BackToCPMButton from "@/components/cpm/BackToCPMButton";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/* ================== UTILS ================== */
function sweptVolume(bore_mm, stroke_mm) {
  const radius_m = bore_mm / 200;
  const stroke_m = stroke_mm / 1000;
  const volume_m3 = Math.PI * radius_m * radius_m * stroke_m;
  return volume_m3 * 1000; // liters
}

function volume(theta, clearance_pct, bore_mm, stroke_mm) {
  const Vs = sweptVolume(bore_mm, stroke_mm);
  const Vc = Vs * (clearance_pct / 100);
  return Vc + (Vs / 2) * (1 - Math.cos((theta * Math.PI) / 180));
}

// ✅ Normalize volume to 0–100%
function normalizedVolume(theta, clearance_pct = 5, bore_mm = 300, stroke_mm = 400) {
  const Vs = sweptVolume(bore_mm, stroke_mm);
  const Vc = Vs * (clearance_pct / 100);

  const v = volume(theta, clearance_pct, bore_mm, stroke_mm);

  const vMin = Vc;
  const vMax = Vs + Vc;

  return ((v - vMin) / (vMax - vMin)) * 100;
}

// ✅ Moving average smoothing
function smoothArray(arr, windowSize = 5) {
  const half = Math.floor(windowSize / 1);
  return arr.map((_, i) => {
    const start = Math.max(0, i - half);
    const end = Math.min(arr.length - 1, i + half);
    const slice = arr.slice(start, end + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / slice.length;
  });
}


export default function PVPTCurvePage() {
  const [curveData, setCurveData] = useState(null);
  const [selectedCylinder, setSelectedCylinder] = useState(1);
  const [selectedCurve, setSelectedCurve] = useState("PT");
  const [selectedEnd, setSelectedEnd] = useState("both");
  const [overlayType, setOverlayType] = useState("None");
  const [error, setError] = useState(null);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const fetchCurves = async () => {
      try {
        const res = await fetch("/api/cpm/curves");
        const data = await res.json();
        if (data?.cylinders) setCurveData(data.cylinders);
        else setError("No curve data available");
      } catch (err) {
        console.error("Failed to fetch curve data:", err);
        setError("API error: Failed to load curve data");
      }
    };
    fetchCurves();
  }, []);

  useEffect(() => {
    setChartKey((prev) => prev + 1);
  }, [selectedCylinder, selectedCurve, selectedEnd, overlayType]);

const chartOptions = useMemo(() => {
  if (!curveData) return {};

  const cyl = curveData[selectedCylinder - 1];
  if (!cyl) return {};

  const angles = [...Array(360).keys()];
  const series = [];

  // Colors from CSS variables
  const getCSSVar = (varName) =>
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue(varName)
      : "";

  const headColor = getCSSVar("--pvpt-head-color") || "#00f5ff";
  const crankColor = getCSSVar("--pvpt-crank-color") || "#ff007f";
  const textColor = getCSSVar("--pvpt-text") || "#222";
  const gridColor = getCSSVar("--pvpt-grid") || "#ccc";
  const tooltipBg = getCSSVar("--pvpt-tooltip-bg") || "#fff";
  const tooltipText = getCSSVar("--pvpt-tooltip-text") || "#000";

  const addSeries = (endLabel, prefix, color) => {
const rawArr = cyl[`${prefix}Raw`] || [];

// ✅ apply smoothing
const smoothedArr = smoothArray(rawArr, 5);

const rawData =
  selectedCurve === "PT"
    ? angles.map((a, i) => [a, smoothedArr[i]])
    : angles.map((a, i) => [normalizedVolume(a), smoothedArr[i]]);

    series.push({
      name: `${endLabel} Raw`,
      type: "line",
      smooth: true,
      showSymbol: false,
      data: rawData,
      lineStyle: { width: 2, color },
    });

    if (overlayType !== "None") {
      const key =
        overlayType === "Theoretical"
          ? `${prefix}Theoretical`
          : `${prefix}Smoothed`;
      const arr = cyl[key] || [];

      const overlayData =
        selectedCurve === "PT"
          ? angles.map((a, i) => [a, arr[i]])
          : angles.map((a, i) => [normalizedVolume(a), arr[i]]);

      series.push({
        name: `${endLabel} ${overlayType}`,
        type: "line",
        smooth: true,
        showSymbol: false,
        data: overlayData,
        lineStyle: { width: 2, type: "dashed", color },
      });
    }
  };

  if (selectedEnd === "head_end" || selectedEnd === "both")
    addSeries("Head End", "HE", headColor);
  if (selectedEnd === "crank_end" || selectedEnd === "both")
    addSeries("Crank End", "CE", crankColor);

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: tooltipBg,
      borderColor: gridColor,
      textStyle: { color: tooltipText },
      formatter: (params) =>
        params
          .map(
            (p) =>
              `<span style="color:${p.color}">●</span> ${p.seriesName}: <b>${p.value[1].toFixed(
                2
              )}</b>`
          )
          .join("<br/>"),
    },
    legend: {
      top: 10,
      textStyle: { color: textColor },
    },
xAxis: {
  type: "value",
  name: selectedCurve === "PV" ? "Cylinder Volume (%)" : "Crank Angle (°)",
  nameLocation: "middle",
  nameGap: 40,
  nameTextStyle: { color: textColor, fontSize: 14 },

  // ✅ Dynamic limits with 5% padding
  min: (value) =>
    selectedCurve === "PV"
      ? Math.max(0, value.min - 5)
      : Math.max(0, value.min - 5),
  max: (value) =>
    selectedCurve === "PV"
      ? Math.min(100, value.max + 5)
      : Math.min(360, value.max + 5),

  axisLine: { lineStyle: { color: gridColor } },
  axisLabel: {
    color: textColor,
    formatter: (val) =>
      selectedCurve === "PV" ? `${Math.max(0, Math.min(100, val))}%` : `${Math.max(0, Math.min(360, val))}°`,
  },
  splitLine: { show: true, lineStyle: { color: gridColor } },
},

    yAxis: {
      type: "value",
      name: "Pressure",
      nameLocation: "middle",
      nameGap: 50,
      nameTextStyle: { color: textColor, fontSize: 14 },
      axisLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: textColor },
      splitLine: { show: true, lineStyle: { color: gridColor } },
      // ✅ Fit tight to data, no big margins
      min: "dataMin",
      max: "dataMax",
    },
    series,
    grid: { left: 80, right: 30, top: 60, bottom: 80 },
    dataZoom: [
      { type: "inside", throttle: 50 },
      { type: "slider", show: true },
    ],
    toolbox: {
      show: true,
      feature: {
        dataZoom: { yAxisIndex: "none" },
        saveAsImage: {},
      },
    },
  };
}, [curveData, selectedCylinder, selectedCurve, selectedEnd, overlayType]);

  return (
    <main className="p-4 space-y-6 min-h-screen w-full bg-background text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          PV / PT Curve (Live Data)
        </h1>

        {/* Controls */}
        <div className="flex gap-2">
          <select
            value={selectedCylinder}
            onChange={(e) => setSelectedCylinder(Number(e.target.value))}
            className="border p-2 rounded-md bg-card text-card-foreground"
          >
            {[1, 2, 3].map((cyl) => (
              <option key={cyl} value={cyl}>
                Cylinder {cyl}
              </option>
            ))}
          </select>

          <select
            value={selectedCurve}
            onChange={(e) => setSelectedCurve(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground"
          >
            <option value="PV">P-V Curve</option>
            <option value="PT">P-T Curve</option>
          </select>

          <select
            value={selectedEnd}
            onChange={(e) => setSelectedEnd(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground"
          >
            <option value="both">Both Ends</option>
            <option value="head_end">Head End</option>
            <option value="crank_end">Crank End</option>
          </select>

          <select
            value={overlayType}
            onChange={(e) => setOverlayType(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground"
          >
            <option value="None">Raw Only</option>
            <option value="Theoretical">Raw + Theoretical</option>
            <option value="Unsmoothed">Raw + Unsmoothed</option>
          </select>
        </div>

        <BackToCPMButton />
      </div>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-card shadow rounded-xl p-4 w-full">
          <ReactECharts
            key={chartKey}
            option={chartOptions}
            style={{ height: 650 }}
          />
        </div>
      )}
    </main>
  );
}
