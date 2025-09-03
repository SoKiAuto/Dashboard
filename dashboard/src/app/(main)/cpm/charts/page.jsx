"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackToCPMButton from "@/components/cpm/BackToCPMButton";  // ✅ NEW


const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ======================= VOLUME & PRESSURE CALCULATIONS ======================= */
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

function pressure(theta, Ps, Pd, clearance_pct, bore_mm, stroke_mm, n = 1.25) {
  const Vs = sweptVolume(bore_mm, stroke_mm);
  const Vc = Vs * clearance_pct / 100;
  const Vbdc = Vc + Vs;
  const Vtdc = Vc;
  const V = volume(theta, clearance_pct, bore_mm, stroke_mm);

  if (theta <= 180) {
    const Kc = Ps * Math.pow(Vbdc, n);
    let P = Kc / Math.pow(V, n);
    return P > Pd ? Pd : P;
  }

  const Ke = Pd * Math.pow(Vtdc, n);
  let P = Ke / Math.pow(V, n);
  return P < Ps ? Ps : P;
}

function generatePVPT(Ps, Pd, clearance_pct, bore_mm, stroke_mm, rpm, n = 1.25) {
  const PV = [];
  const PT = [];
  for (let theta = 0; theta <= 360; theta += 1) {
    const V = volume(theta, clearance_pct, bore_mm, stroke_mm);
    const P = pressure(theta, Ps, Pd, clearance_pct, bore_mm, stroke_mm, n);
    const time = (theta / 360) * (60 / rpm);
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

  const chartData = useMemo(() => {
    // ✅ Default chart data if no live data available
    if (!liveData) {
      const defaultData = Array.from({ length: 12 }, (_, i) => ({
        x: i * 5,
        y: 50 + Math.sin(i / 2) * 10,
      }));

      return {
        series: [
          { name: "Suction Pressure", data: defaultData },
          {
            name: "Discharge Pressure",
            data: defaultData.map((d) => ({ x: d.x, y: d.y + 20 })),
          },
        ],
        options: {
          chart: {
            id: "default-pvpt-chart",
            type: "line",
            background: "transparent",
          },
          stroke: { curve: "smooth", width: 3 },
          xaxis: { title: { text: "Time (Minutes)" } },
          yaxis: { title: { text: "Pressure (psi)" } },
          tooltip: { theme: "dark" },
          colors: ["#00E396", "#FF4560"],
          legend: {
            position: "top",
            labels: {
              colors:
                typeof window !== "undefined" &&
                document.documentElement.classList.contains("dark")
                  ? "#fff"
                  : "#000",
            },
          },
        },
      };
    }

    const cyl = liveData.values.cylinders[selectedCylinder];
    if (!cyl) return { series: [], options: {} };

    const rpm = liveData.values.unit?.Unit_RPM || 600;
    const bore = cyl.Bore_mm || 100;
    const stroke = cyl.Stroke_mm || 150;

    const HEData = generatePVPT(
      cyl.head_end?.Suction_Pressure_psi || 0,
      cyl.head_end?.Discharge_Pressure_psi || 0,
      cyl.head_end?.Clearance_pct || 5,
      bore,
      stroke,
      rpm
    );

    const CEData = generatePVPT(
      cyl.crank_end?.Suction_Pressure_psi || 0,
      cyl.crank_end?.Discharge_Pressure_psi || 0,
      cyl.crank_end?.Clearance_pct || 5,
      bore,
      stroke,
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
          mode:
            typeof window !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? "dark"
              : "light",
        },
        stroke: { curve: "smooth", width: 3 },
        markers: { size: 0 },
        xaxis: {
          title: {
            text:
              selectedCurve === "PV"
                ? "Cylinder Volume (Liters)"
                : "Crank Angle (°)",
          },
          decimalsInFloat: 1,
          tickAmount: selectedCurve === "PV" ? 8 : 9,
          labels: {
            rotate: selectedCurve === "PT" ? -30 : 0,
            formatter: (val) => Number(val).toFixed(1),
          },
        },
        yaxis: {
          title: { text: "Pressure (psi)" },
          decimalsInFloat: 1,
          tickAmount: 6,
          labels: {
            formatter: (val) => Number(val).toFixed(1),
          },
        },
        tooltip: {
          theme: "dark",
          y: { formatter: (val) => Number(val).toFixed(1) },
          x: {
            formatter: (val) =>
              selectedCurve === "PV"
                ? `${Number(val).toFixed(2)} L`
                : `${val}°`,
          },
        },
        colors: ["#00E396", "#FF4560"],
        legend: {
          position: "top",
          labels: {
            colors:
              typeof window !== "undefined" &&
              document.documentElement.classList.contains("dark")
                ? "#fff"
                : "#000",
          },
        },
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
          <select
            value={selectedCylinder}
            onChange={(e) => setSelectedCylinder(e.target.value)}
            className="border p-2 rounded-md bg-card text-card-foreground"
          >
            {["cylinder_1", "cylinder_2", "cylinder_3"].map((cyl) => (
              <option key={cyl} value={cyl}>
                {cyl.replace("_", " ").toUpperCase()}
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
          
        </div>
           {/* ✅ Back Button */}
    <BackToCPMButton />
      </div>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-card shadow rounded-xl p-4 w-full">
          <ApexChart
            options={chartData.options}
            series={chartData.series}
            type="line"
            height={600}
          />
        </div>
      )}
    </main>
  );
}
