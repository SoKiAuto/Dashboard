"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ======================= CALCULATION FUNCTIONS ======================= */
// Volume calculation based on crank angle
function volume(theta, clearance) {
  const CR = clearance / 100;
  const Vs = 1; // normalized swept volume
  const Vc = Vs * CR;
  return Vc + (Vs / 2) * (1 - Math.cos((theta * Math.PI) / 180));
}

// Pressure calculation based on crank angle
function pressure(theta, Ps, Pd, clearance, n = 1.25) {
  const Vs = 1;
  const Vc = Vs * clearance / 100;
  const Vbdc = Vc + Vs;
  const Vtdc = Vc;
  const V = volume(theta, clearance);

  // Compression
  if (theta <= 180) {
    const Kc = Ps * Math.pow(Vbdc, n);
    let P = Kc / Math.pow(V, n);
    if (P > Pd) P = Pd; // Plateau during discharge
    return P;
  }

  // Expansion
  const Ke = Pd * Math.pow(Vtdc, n);
  let P = Ke / Math.pow(V, n);
  if (P < Ps) P = Ps; // Plateau during suction
  return P;
}

// Generates PV & PT datasets for a cylinder end
function generatePVPT(Ps, Pd, clearance, rpm, n = 1.25) {
  const PV = [];
  const PT = [];

  for (let theta = 0; theta <= 360; theta += 1) {
    const V = volume(theta, clearance);
    const P = pressure(theta, Ps, Pd, clearance, n);
    const time = (theta / 360) * (60 / rpm); // seconds

    PV.push({ x: V, y: P });
    PT.push({ x: theta, y: P });
  }

  return { PV, PT };
}

/* ======================= MAIN COMPONENT ======================= */
export default function PVPTCurvePage() {
  const [liveData, setLiveData] = useState(null);
  const [selectedCylinder, setSelectedCylinder] = useState("cylinder_1");
  const [selectedCurve, setSelectedCurve] = useState("PV");
  const [selectedEnd, setSelectedEnd] = useState("both");
  const [error, setError] = useState(null);

  // Fetch Live CPM Data
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const res = await fetch("/api/cpm/live");
        const data = await res.json();
        if (data?.values?.cylinders) {
          setLiveData(data);
          setError(null);
        } else {
          setError("No live data available");
        }
      } catch (err) {
        console.error("Failed to fetch live data:", err);
        setError("API error: Failed to load live data");
      }
    };
    fetchLiveData();
  }, []);

  // Chart Data Generation (using old calculation logic)
  const chartData = useMemo(() => {
    if (!liveData) {
      return {
        series: [],
        options: {
          chart: { id: "pvpt-chart", type: "line", background: "transparent" },
          xaxis: { title: { text: selectedCurve === "PV" ? "Volume" : "Crank Angle (°)" } },
          yaxis: { title: { text: "Pressure (psi)" } },
        },
      };
    }

    const cyl = liveData.values.cylinders[selectedCylinder];
    if (!cyl) return { series: [], options: {} };

    const rpm = liveData.values.unit?.Unit_RPM || 600;

    // Generate datasets for Head & Crank Ends
    const HEData = generatePVPT(
      cyl.head_end?.Suction_Pressure_psi || 0,
      cyl.head_end?.Discharge_Pressure_psi || 0,
      cyl.head_end?.Clearance_pct || 5,
      rpm
    );

    const CEData = generatePVPT(
      cyl.crank_end?.Suction_Pressure_psi || 0,
      cyl.crank_end?.Discharge_Pressure_psi || 0,
      cyl.crank_end?.Clearance_pct || 5,
      rpm
    );

    const series = [];
    if (selectedEnd === "head_end" || selectedEnd === "both") {
      series.push({
        name: "Head End",
        data: selectedCurve === "PV" ? HEData.PV : HEData.PT,
      });
    }
    if (selectedEnd === "crank_end" || selectedEnd === "both") {
      series.push({
        name: "Crank End",
        data: selectedCurve === "PV" ? CEData.PV : CEData.PT,
      });
    }

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
        theme: {
          mode: typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
        },
        stroke: { curve: "smooth", width: 3 },
        markers: { size: 0 },
        xaxis: {
          title: {
            text: selectedCurve === "PV" ? "Volume (normalized)" : "Crank Angle (°)",
          },
        },
        yaxis: {
          title: { text: "Pressure (psi)" },
        },
        tooltip: { theme: "dark" },
        colors: ["#00E396", "#FF4560"],
        legend: { position: "top" },
      },
    };
  }, [liveData, selectedCylinder, selectedCurve, selectedEnd]);

  return (
    <main className="p-4 space-y-6 min-h-screen w-full bg-background text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          PV / PT Curve
        </h1>

        <div className="flex gap-2">
          {/* Cylinder Selector */}
          <select
            value={selectedCylinder}
            onChange={(e) => setSelectedCylinder(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground"
          >
            {["cylinder_1", "cylinder_2", "cylinder_3", "cylinder_4"].map((cyl) => (
              <option key={cyl} value={cyl}>
                {cyl.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>

          {/* Curve Selector */}
          <select
            value={selectedCurve}
            onChange={(e) => setSelectedCurve(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground"
          >
            <option value="PV">P-V Curve</option>
            <option value="PT">P-T Curve</option>
          </select>

          {/* End Selector */}
          <select
            value={selectedEnd}
            onChange={(e) => setSelectedEnd(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground"
          >
            <option value="both">Both Ends</option>
            <option value="head_end">Head End</option>
            <option value="crank_end">Crank End</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : chartData.series.length === 0 ? (
        <div className="h-[600px] flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      ) : (
        <div className="bg-card shadow rounded-xl p-4 w-full">
          <ApexChart options={chartData.options} series={chartData.series} type="line" height={600} />
        </div>
      )}
    </main>
  );
}
