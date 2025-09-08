"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendingUp } from "lucide-react";
import BackToCPMButton from "@/components/cpm/BackToCPMButton";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ======================= UTILS ======================= */
function sweptVolume(bore_mm, stroke_mm) {
  const radius_m = bore_mm / 200;
  const stroke_m = stroke_mm / 1000;
  const volume_m3 = Math.PI * radius_m * radius_m * stroke_m;
  return volume_m3 * 1000;
}
function volume(theta, clearance_pct, bore_mm, stroke_mm) {
  const Vs = sweptVolume(bore_mm, stroke_mm);
  const Vc = Vs * (clearance_pct / 100);
  return Vc + (Vs / 2) * (1 - Math.cos((theta * Math.PI) / 180));
}
function getCSSVar(name) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ======================= MAIN ======================= */
export default function PVPTCurvePage() {
  const [curveData, setCurveData] = useState(null);
  const [selectedCylinder, setSelectedCylinder] = useState(1);
  const [selectedCurve, setSelectedCurve] = useState("PT");
  const [selectedEnd, setSelectedEnd] = useState("both");
  const [overlayType, setOverlayType] = useState("None");
  const [error, setError] = useState(null);

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

  const chartData = useMemo(() => {
    if (!curveData) return { series: [], options: {} };
    const cyl = curveData[selectedCylinder - 1];
    if (!cyl) return { series: [], options: {} };

    // Geometry placeholders
    const bore = 100, stroke = 150, clearance = 5;
    const angles = [...Array(360).keys()];

    const chartColors = [
      getCSSVar("--chart-1"),
      getCSSVar("--chart-2"),
      getCSSVar("--chart-3"),
      getCSSVar("--chart-4"),
    ];

    const series = [];
    const addSeries = (endLabel, prefix, colorIdx) => {
      const rawArr = cyl[`${prefix}Raw`] || [];
      const rawData = selectedCurve === "PT"
        ? angles.map((a, i) => ({ x: a, y: rawArr[i] }))
        : rawArr.map((p, i) => ({ x: volume(i, clearance, bore, stroke), y: p }));

      series.push({
        name: `${endLabel} Raw`,
        data: rawData,
        color: chartColors[colorIdx],
      });

      if (overlayType !== "None") {
        const key = overlayType === "Theoretical" ? `${prefix}Theoretical` : `${prefix}Smoothed`;
        const arr = cyl[key] || [];
        const overlayData = selectedCurve === "PT"
          ? angles.map((a, i) => ({ x: a, y: arr[i] }))
          : arr.map((p, i) => ({ x: volume(i, clearance, bore, stroke), y: p }));

        series.push({
          name: `${endLabel} ${overlayType}`,
          data: overlayData,
          color: chartColors[colorIdx],
          dashArray: 6, // dotted
        });
      }
    };

    if (selectedEnd === "head_end" || selectedEnd === "both") addSeries("Head End", "HE", 0);
    if (selectedEnd === "crank_end" || selectedEnd === "both") addSeries("Crank End", "CE", 1);

    return {
      series,
      options: {
        chart: {
          id: "pvpt-chart",
          type: "line",
          zoom: { enabled: true },
          toolbar: { show: true },
          background: "transparent",
        },
        stroke: { curve: "smooth", width: 2 },
        xaxis: {
          title: {
            text: selectedCurve === "PV" ? "Cylinder Volume (L)" : "Crank Angle (°)",
          },
          min: selectedCurve === "PT" ? 0 : undefined,
          max: selectedCurve === "PT" ? 360 : undefined,
          tickAmount: selectedCurve === "PT" ? 12 : undefined, // 0,30,60..360
        },
        yaxis: {
          title: { text: "Pressure" },
        },
        tooltip: {
          theme: "dark",
          x: {
            formatter: (val) =>
              selectedCurve === "PV" ? `${val.toFixed(2)} L` : `${val}°`,
          },
          y: { formatter: (val) => Number(val).toFixed(2) },
        },
        legend: { position: "top" },
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

        <div className="flex gap-2">
          <select value={selectedCylinder} onChange={(e) => setSelectedCylinder(Number(e.target.value))}
            className="border p-2 rounded-md bg-card text-card-foreground">
            {[1,2,3].map(cyl => <option key={cyl} value={cyl}>Cylinder {cyl}</option>)}
          </select>

          <select value={selectedCurve} onChange={(e) => setSelectedCurve(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground">
            <option value="PV">P-V Curve</option>
            <option value="PT">P-T Curve</option>
          </select>

          <select value={selectedEnd} onChange={(e) => setSelectedEnd(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground">
            <option value="both">Both Ends</option>
            <option value="head_end">Head End</option>
            <option value="crank_end">Crank End</option>
          </select>

          <select value={overlayType} onChange={(e) => setOverlayType(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground">
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
          <ApexChart options={chartData.options} series={chartData.series} type="line" height={600}/>
        </div>
      )}
    </main>
  );
}
