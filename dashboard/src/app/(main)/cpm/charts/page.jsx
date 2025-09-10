"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendingUp } from "lucide-react";
import BackToCPMButton from "@/components/cpm/BackToCPMButton";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function PVPTCurvePage() {
  const [curveData, setCurveData] = useState(null);
  const [selectedCylinder, setSelectedCylinder] = useState(1);
  const [selectedCurve, setSelectedCurve] = useState("PT");
  const [selectedEnd, setSelectedEnd] = useState("both");
  const [overlayType, setOverlayType] = useState("None");
  const [error, setError] = useState(null);
  const [chartKey, setChartKey] = useState(0); // ✅ Force chart refresh

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

  // ✅ Force refresh chart on selection changes
  useEffect(() => {
    setChartKey((prev) => prev + 1);
  }, [selectedCylinder, selectedCurve, selectedEnd, overlayType]);

  const chartOptions = useMemo(() => {
    if (!curveData) return {};

    const cyl = curveData[selectedCylinder - 1];
    if (!cyl) return {};

    const angles = [...Array(360).keys()];
    const series = [];

    // 🎨 Get theme colors from CSS variables
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

      const rawData =
        selectedCurve === "PT"
          ? angles.map((a, i) => [a, rawArr[i]])
          : rawArr.map((p, i) => [(i / 359) * 100, p]);

      series.push({
        name: `${endLabel} Raw`,
        type: "line",
        smooth: true,
        showSymbol: false,
        data: rawData,
        lineStyle: { width: 2, color },
      });

      // Overlay data if enabled
      if (overlayType !== "None") {
        const key =
          overlayType === "Theoretical"
            ? `${prefix}Theoretical`
            : `${prefix}Smoothed`;
        const arr = cyl[key] || [];

        const overlayData =
          selectedCurve === "PT"
            ? angles.map((a, i) => [a, arr[i]])
            : arr.map((p, i) => [(i / 359) * 100, p]);

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
        min: 0,
        max: selectedCurve === "PV" ? 100 : 360,
        interval: selectedCurve === "PT" ? 90 : 20,
        axisLine: { lineStyle: { color: gridColor } },
        axisLabel: {
          color: textColor,
          formatter: (value) =>
            selectedCurve === "PT" ? `${value}°` : `${value}%`,
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
          {/* Cylinder Select */}
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

          {/* Curve Type */}
          <select
            value={selectedCurve}
            onChange={(e) => setSelectedCurve(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground"
          >
            <option value="PV">P-V Curve</option>
            <option value="PT">P-T Curve</option>
          </select>

          {/* End Selection */}
          <select
            value={selectedEnd}
            onChange={(e) => setSelectedEnd(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground"
          >
            <option value="both">Both Ends</option>
            <option value="head_end">Head End</option>
            <option value="crank_end">Crank End</option>
          </select>

          {/* Overlay Type */}
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
          <ReactECharts key={chartKey} option={chartOptions} style={{ height: 600 }} />
        </div>
      )}
    </main>
  );
}
