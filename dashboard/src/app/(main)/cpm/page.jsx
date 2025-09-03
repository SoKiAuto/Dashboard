"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gauge, Factory, Siren, LineChart, BarChart3, Settings } from "lucide-react";

import CPMUnitOverviewTile from "@/components/CPMUnitOverviewTile";
import CPMAlarmFlagsTile from "@/components/CPMAlarmFlagsTile";
import CPMCylinderTile from "@/components/CPMCylinderTile";
import CPMStageTile from "@/components/CPMStageTile";

export default function SentinelCPMPage() {
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);

  async function fetchData() {
    try {
      const res = await fetch("/api/cpm/live", { cache: "no-store" });
      const data = await res.json();

      // Accept array or single object. Prefer channel === "STRUCT".
      let struct = null;
      if (Array.isArray(data)) {
        struct = data.find((d) => d?.channel === "STRUCT") || data[0] || null;
      } else if (data?.channel === "STRUCT" || data?.values) {
        struct = data;
      }

      if (!struct?.values) {
        setError("No structured CPM data found.");
        setDoc(null);
      } else {
        setDoc(struct);
        setError(null);
      }
    } catch (e) {
      console.error("Error fetching CPM data:", e);
      setError(e.message || "Fetch failed");
      setDoc(null);
    }
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 2000);
    return () => clearInterval(id);
  }, []);

  const unit = useMemo(() => doc?.values?.unit || null, [doc]);
  const cylinders = useMemo(() => doc?.values?.cylinders || {}, [doc]);
  const stages = useMemo(() => doc?.values?.stages || {}, [doc]);

  // Get sorted cylinder keys but limit to first 3
  const cylinderKeys = useMemo(
    () =>
      Object.keys(cylinders)
        .sort((a, b) => {
          const ai = parseInt(a.split("_")[1] || "0", 10);
          const bi = parseInt(b.split("_")[1] || "0", 10);
          return ai - bi;
        })
        .slice(0, 3), // ✅ Only first 3 cylinders
    [cylinders]
  );

  // Get sorted stage keys but limit to first 3
  const stageKeys = useMemo(
    () =>
      Object.keys(stages)
        .sort((a, b) => {
          const ai = parseInt(a.split("_")[1] || "0", 10);
          const bi = parseInt(b.split("_")[1] || "0", 10);
          return ai - bi;
        })
        .slice(0, 3), // ✅ Only first 3 stages
    [stages]
  );

  return (
    <main className="p-4 space-y-9 min-h-screen w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Sentinel-CPM Dashboard</h1>
          <Factory className="w-7 h-7 text-emerald-500" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* New PV/PT Curves Button */}
          <Link href="/cpm/charts">
            <Button variant="secondary">
              <BarChart3 className="w-4 h-4 mr-2" /> PV/PT Curves
            </Button>
          </Link>

          <Link href="/cpm/diagnostic">
            <Button variant="secondary">
              <Gauge className="w-4 h-4 mr-2" /> Diagnostic
            </Button>
          </Link>

          <Link href="/cpm/alarms">
            <Button variant="secondary">
              <Siren className="w-4 h-4 mr-2" /> Alarms
            </Button>
          </Link>

          <Link href="/cpm/setpoints">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" /> Setpoints
            </Button>
          </Link>

          <Link href="/cpm/trends">
            <Button variant="outline">
              <LineChart className="w-4 h-4 mr-2" /> Trends
            </Button>
          </Link>
        </div>
      </div>

      {/* Error / No Data */}
      {!doc && (
        <div className="text-sm text-muted-foreground">
          {error ? `Error: ${error}` : "Loading CPM data..."}
        </div>
      )}

      {/* Unit Overview (full width) */}
      {unit && (
        <section>
          <CPMUnitOverviewTile unit={unit} timestamp={doc?.timestamp} />
        </section>
      )}

      {/* Alarm Flags (full width, below Unit Overview) */}
      {unit && (
        <section>
          <CPMAlarmFlagsTile unit={unit} />
        </section>
      )}

      {/* Cylinders (big tiles; only key metrics in tile) */}
      {cylinderKeys.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mt-6 mb-3">Cylinders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cylinderKeys.map((key) => (
              <CPMCylinderTile key={key} name={key} data={cylinders[key]} />
            ))}
          </div>
        </section>
      )}

      {/* Stages (simple tiles; show all metrics) */}
      {stageKeys.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mt-6 mb-3">Stages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {stageKeys.map((key) => (
              <CPMStageTile key={key} name={key} data={stages[key]} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
