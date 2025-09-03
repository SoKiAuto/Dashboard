"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import BulletBar from "@/components/charts/BulletBar";
import { useRouter } from "next/navigation";

// ------- Donut Gauge (Animated CPM KPIs) -------
function DonutGauge({ label, value = 0, max = 100, unit = "", colorVar = "--chart-1" }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const data = useMemo(
    () => [
      { name: "value", val: value },
      { name: "rest", val: Math.max(0, max - value) },
    ],
    [value, max]
  );

  const COLORS = [`var(${colorVar})`, "color-mix(in oklch, var(--muted) 85%, black 0%)"];

  return (
    <Card className="shadow-lg border border-border">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold tracking-wide">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <div className="w-36 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(v) => `${v} ${unit}`} />
                <Pie
                  data={data}
                  dataKey="val"
                  nameKey="name"
                  innerRadius="70%"
                  outerRadius="95%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="transparent"
                >
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold tabular-nums">
              {value?.toFixed ? value.toFixed(0) : value} {" "}
              <span className="text-base font-medium text-muted-foreground">{unit}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Max: {max} {unit}</div>
            <div className="w-full h-2 mt-3 rounded bg-muted overflow-hidden">
              <div
                className="h-full transition-all duration-700 ease-in-out rounded bg-gradient-to-r from-green-500 via-yellow-400 to-red-500"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Unit1Dashboard() {
  const [vm, setVM] = useState({ rpm: null, channels: [] });
  const [cpm, setCPM] = useState({ rpm: 0, hp: 0, suction: 0, discharge: 0, cylinders: {} });
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [vmRes, cpmRes] = await Promise.all([
          fetch("/api/vm/live", { cache: "no-store" }),
          fetch("/api/cpm/live", { cache: "no-store" }),
        ]);

        const vmRaw = await vmRes.json();
        const cpmRaw = await cpmRes.json();

        const rpmDoc = (Array.isArray(vmRaw) && vmRaw.find((d) => d.channel === "RPM")) || null;

        const channels = (Array.isArray(vmRaw) ? vmRaw.filter((d) => typeof d.channel === "number") : [])
          .map((d) => ({
            channel: d.channel,
            label: d?.config?.location || `Ch ${d.channel}`,
            overall: d?.values?.Overall_RMS ?? null,
          }))
          .filter((d) => typeof d.overall === "number");

        const v = cpmRaw?.values || {};
        const formattedCPM = {
          rpm: v?.unit?.Unit_RPM ?? 0,
          hp: v?.unit?.Total_HP ?? 0,
          suction: v?.stages?.stage_1?.Avg_Suction_Pressure_psi ?? 0,
          discharge: v?.stages?.stage_1?.Avg_Discharge_Pressure_psi ?? 0,
          cylinders: v?.cylinders ?? {},
        };

        setVM({ rpm: rpmDoc?.values?.RPM ?? null, channels });
        setCPM(formattedCPM);
        setUpdatedAt(new Date().toLocaleTimeString());
      } catch (e) {
        console.error(e);
        toast.error("Failed to fetch Unit 1 live data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, []);

  const topCylinders = useMemo(() => {
    const keys = Object.keys(cpm.cylinders || {})
      .sort((a, b) => parseInt(a.split("_")[1] || "0") - parseInt(b.split("_")[1] || "0"))
      .slice(0, 3);

    return keys.map((k) => ({
      name: k.replace("_", " "),
      suction: cpm.cylinders[k]?.head_end?.Suction_Pressure_psi ?? 0,
      discharge: cpm.cylinders[k]?.head_end?.Discharge_Pressure_psi ?? 0,
      volume: cpm.cylinders[k]?.Actual_Cylinder_Volume ?? 0,
    }));
  }, [cpm]);

  const top3VM = useMemo(() => {
    return (vm.channels || [])
      .slice()
      .sort((a, b) => (b.overall || 0) - (a.overall || 0))
      .slice(0, 3);
  }, [vm.channels]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[--primary]" />
        <span className="ml-3 text-sm text-muted-foreground">Loading Unit 1…</span>
      </div>
    );
  }

  const RPM_MAX = Math.max(1000, cpm.rpm * 1.2);
  const HP_MAX = Math.max(500, cpm.hp * 1.2);
  const SUCT_MAX = 300;
  const DISC_MAX = 600;

  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-wide">Unit 1 — Advanced Overview</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Updated: {updatedAt}</span>
          <Button variant="secondary" onClick={() => router.push("/cpm")}>
            CPM Dashboard
          </Button>
          <Button variant="secondary" onClick={() => router.push("/vm")}>
            VM Dashboard
          </Button>
        </div>
      </div>

      {/* Row: CPM Gauges + Right combined card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT CPM Gauges */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">CPM — Unit KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DonutGauge label="Unit RPM" value={cpm.rpm || 0} max={RPM_MAX} unit="rpm" colorVar="--chart-1" />
              <DonutGauge label="Total HP" value={cpm.hp || 0} max={HP_MAX} unit="hp" colorVar="--chart-5" />
              <DonutGauge label="Stage 1 Suction" value={cpm.suction || 0} max={SUCT_MAX} unit="psi" colorVar="--chart-2" />
              <DonutGauge label="Stage 1 Discharge" value={cpm.discharge || 0} max={DISC_MAX} unit="psi" colorVar="--destructive" />
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Cylinders + Top3 VM */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">CPM Cylinders & VM Critical Channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Top Cylinders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topCylinders.map((cyl, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold capitalize">{cyl.name}</div>
                    <div className="text-xs text-muted-foreground">HE</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[11px] text-muted-foreground">Suction</div>
                    <div className="w-full h-2 bg-muted rounded overflow-hidden">
                      <div
                        className="h-2"
                        style={{
                          width: `${Math.min(100, (cyl.suction / SUCT_MAX) * 100)}%`,
                          background: "linear-gradient(90deg,#60a5fa,#3b82f6)",
                          transition: "width 700ms ease",
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-2">Discharge</div>
                    <div className="w-full h-2 bg-muted rounded overflow-hidden">
                      <div
                        className="h-2"
                        style={{
                          width: `${Math.min(100, (cyl.discharge / DISC_MAX) * 100)}%`,
                          background: "linear-gradient(90deg,#fb7185,#ef4444)",
                          transition: "width 700ms ease",
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs flex justify-between">
                      <span>{cyl.suction?.toFixed ? cyl.suction.toFixed(1) : cyl.suction} psi</span>
                      <span>{cyl.discharge?.toFixed ? cyl.discharge.toFixed(1) : cyl.discharge} psi</span>
                    </div>

                    {/* NEW: Actual Cylinder Volume */}
                    <div className="mt-3 text-xs text-muted-foreground">
                      <span className="font-medium">Volume: </span>
                      {cyl.volume?.toFixed ? cyl.volume.toFixed(2) : cyl.volume} L
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top 3 VM Channels */}
            <hr className="border-t border-border" />
            <div className="grid grid-cols-1 gap-3">
              {top3VM.map((ch) => (
                <div key={ch.channel}>
                  <BulletBar
                    label={`${ch.label} (Ch ${ch.channel})`}
                    value={ch.overall}
                    max={20}
                    thresholds={{ warn: 10, crit: 20 }}
                    unit="mm/s"
                  />
                </div>
              ))}
              {top3VM.length === 0 && <div className="text-sm text-muted-foreground">No VM channel data available.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
