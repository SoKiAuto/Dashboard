"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Activity, BatteryWarning, Factory, Gauge, Sparkles } from "lucide-react";
import BackToCPMButton from "@/components/cpm/BackToCPMButton";  // ✅ NEW


// Lazy load ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/** -----------------------------
 * MOCK DATA (matches your schema)
 * -------------------------------- */
const mockDoc = {
  channel: "STRUCT",
  source: "Sentinel-CPM",
  quality: 192,
  timestamp: new Date().toISOString(),
  values: {
    unit: {
      Unit_RPM: 799,
      Total_HP: 364.9,
      Avg_Discharge_Temp_F: 0,
      Avg_Suction_Temp_F: 0,
      Sensor_Bad_Flag_Raw: 0,
      Sensor_Bad_Flag: {
        cylinder_1: { head_end: false, crank_end: false },
        cylinder_2: { head_end: false, crank_end: false },
        cylinder_3: { head_end: false, crank_end: false },
        cylinder_4: { head_end: false, crank_end: false },
        cylinder_5: { head_end: false, crank_end: false },
        cylinder_6: { head_end: false, crank_end: false },
      },
      Alarm_Bits_Raw: 2,
      Alarm_Bits: {
        cylinder_1: { head_end: false, crank_end: true },
        cylinder_2: { head_end: false, crank_end: false },
        cylinder_3: { head_end: false, crank_end: false },
        cylinder_4: { head_end: false, crank_end: false },
        cylinder_5: { head_end: false, crank_end: false },
        cylinder_6: { head_end: false, crank_end: false },
      },
    },
    cylinders: {
      cylinder_1: {
        Crosshead_Pin_Reversal_Deg: 154,
        Rod_Load_Tension_kLbf: 24.9,
        Rod_Load_Compression_kLbf: 36.6,
        head_end: {
          HP: 744.3,
          Discharge_Pressure_psi: 391.5,
          Suction_Pressure_psi: 173.5,
          Vol_Eff_Discharge_pct: 37.3,
          Vol_Eff_Suction_pct: 70.8,
          Theoretical_Discharge_Temp_F: 202,
          Flow_Balance_pct: 1.06,
          Cylinder_Flow_MMSCFD: 16.47,
          Clearance_pct: 38.06,
        },
        crank_end: {
          HP: 476.7,
          Discharge_Pressure_psi: 367.9,
          Suction_Pressure_psi: 164,
          Vol_Eff_Discharge_pct: 28.5,
          Vol_Eff_Suction_pct: 50.6,
          Theoretical_Discharge_Temp_F: 201,
          Flow_Balance_pct: 1.0,
          Cylinder_Flow_MMSCFD: 10.85,
          Clearance_pct: 61.46,
        },
      },
      cylinder_2: {
        Crosshead_Pin_Reversal_Deg: 160,
        Rod_Load_Tension_kLbf: 27.1,
        Rod_Load_Compression_kLbf: 4.1,
        head_end: {
          HP: 129.1,
          Discharge_Pressure_psi: 169.6,
          Suction_Pressure_psi: 167.1,
          Vol_Eff_Discharge_pct: 0,
          Vol_Eff_Suction_pct: 0,
          Theoretical_Discharge_Temp_F: 83,
          Flow_Balance_pct: 0,
          Cylinder_Flow_MMSCFD: 0,
          Clearance_pct: 0,
        },
        crank_end: {
          HP: 450.9,
          Discharge_Pressure_psi: 220.7,
          Suction_Pressure_psi: 155.2,
          Vol_Eff_Discharge_pct: 43.3,
          Vol_Eff_Suction_pct: 85.1,
          Theoretical_Discharge_Temp_F: 196,
          Flow_Balance_pct: 1.16,
          Cylinder_Flow_MMSCFD: 15.39,
          Clearance_pct: 18.06,
        },
      },
      cylinder_3: {
        Crosshead_Pin_Reversal_Deg: 154,
        Rod_Load_Tension_kLbf: 27.1,
        Rod_Load_Compression_kLbf: 37.6,
        head_end: {
          HP: 842.6,
          Discharge_Pressure_psi: 398.6,
          Suction_Pressure_psi: 175,
          Vol_Eff_Discharge_pct: 42.6,
          Vol_Eff_Suction_pct: 82.9,
          Theoretical_Discharge_Temp_F: 203,
          Flow_Balance_pct: 1.08,
          Cylinder_Flow_MMSCFD: 19.08,
          Clearance_pct: 23.99,
        },
        crank_end: {
          HP: 759.7,
          Discharge_Pressure_psi: 385.2,
          Suction_Pressure_psi: 164.1,
          Vol_Eff_Discharge_pct: 41.5,
          Vol_Eff_Suction_pct: 82.3,
          Theoretical_Discharge_Temp_F: 207,
          Flow_Balance_pct: 1.07,
          Cylinder_Flow_MMSCFD: 16.49,
          Clearance_pct: 23.47,
        },
      },
   
  
   
    },
    stages: {
      stage_1: {
        Flow_MMSCFD: 78.3,
        Avg_Suction_Pressure_psi: 166.4,
        Avg_Discharge_Pressure_psi: 384,
        Avg_Suction_Temp_F: 91,
        Avg_Discharge_Temp_F: 225,
      },
      stage_2: {
        Flow_MMSCFD: 0,
        Avg_Suction_Pressure_psi: 0,
        Avg_Discharge_Pressure_psi: 0,
        Avg_Suction_Temp_F: 0,
        Avg_Discharge_Temp_F: 0,
      },
       },
  },
};

/** -----------------------------
 * SIMPLE HELPERS
 * -------------------------------- */
const hpRisk = (hp) => (hp > 800 ? 3 : hp > 500 ? 2 : hp > 200 ? 1 : 0);
const pressRisk = (dis, suc) => (dis > 390 ? 3 : dis > 350 ? 2 : dis > 300 ? 1 : 0) + (suc < 150 ? 1 : 0);
const veRisk = (ve) => (ve === 0 ? 2 : ve < 35 ? 2 : ve < 50 ? 1 : 0);
const flowBalRisk = (fb) => (fb === 0 ? 1 : fb < 0.9 || fb > 1.1 ? 1 : 0);

const scoreCylinder = (c) => {
  const he = c.head_end || {};
  const ce = c.crank_end || {};
  const score =
    hpRisk(he.HP) +
    hpRisk(ce.HP) +
    pressRisk(he.Discharge_Pressure_psi, he.Suction_Pressure_psi) +
    pressRisk(ce.Discharge_Pressure_psi, ce.Suction_Pressure_psi) +
    veRisk(he.Vol_Eff_Discharge_pct) +
    veRisk(ce.Vol_Eff_Discharge_pct) +
    flowBalRisk(he.Flow_Balance_pct) +
    flowBalRisk(ce.Flow_Balance_pct);

  return score;
};

const statusBadge = (score) =>
  score >= 6 ? (
    <Badge className="bg-red-600 text-white">Critical</Badge>
  ) : score >= 3 ? (
    <Badge className="bg-amber-500 text-white">Warning</Badge>
  ) : (
    <Badge className="bg-emerald-600 text-white">Normal</Badge>
  );

/** -----------------------------
 * PAGE
 * -------------------------------- */
export default function CPMDiagnosticPage() {
  const doc = mockDoc; // later, replace with live fetch
  const { unit, cylinders, stages } = doc.values;

  const cylinderList = useMemo(() => Object.entries(cylinders || {}), [cylinders]);

  // Top 3 problematic cylinders by score
  const top3 = useMemo(() => {
    const scored = cylinderList
      .map(([key, c]) => ({ key, score: scoreCylinder(c), c }))
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, 3);
  }, [cylinderList]);

  // KPIs
  const badSensorsCount = useMemo(() => {
    const flag = unit.Sensor_Bad_Flag || {};
    let n = 0;
    Object.values(flag).forEach((ends) => {
      if (ends.head_end) n++;
      if (ends.crank_end) n++;
    });
    return n;
  }, [unit]);

  const activeAlarms = useMemo(() => {
    const bits = unit.Alarm_Bits || {};
    return Object.entries(bits)
      .flatMap(([ckey, ends]) =>
        ["head_end", "crank_end"].filter((e) => ends[e]).map((e) => `${ckey} • ${e}`)
      );
  }, [unit]);

  // Charts data (snapshot comparisons)
  const chartCats = cylinderList.map(([key]) => key.replace("cylinder_", "C"));
  const seriesHP_HE = cylinderList.map(([_, c]) => c.head_end?.HP || 0);
  const seriesHP_CE = cylinderList.map(([_, c]) => c.crank_end?.HP || 0);
  const seriesDis = cylinderList.map(([_, c]) => c.head_end?.Discharge_Pressure_psi || 0);
  const seriesSuc = cylinderList.map(([_, c]) => c.head_end?.Suction_Pressure_psi || 0);

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-secondary">
            <Factory className="w-5 h-5 text-secondary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">CPM Diagnostic Overview</h1>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(doc.timestamp).toLocaleTimeString()}
                {/* ✅ Back Button */}
    <BackToCPMButton />
        </div>
      </div>
      

      {/* Unit Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Unit RPM</span>
            <Gauge className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold mt-1">{unit.Unit_RPM}</div>
          <Progress className="mt-3" value={Math.min((unit.Unit_RPM / 1200) * 100, 100)} />
        </Card>

        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total HP</span>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold mt-1">{unit.Total_HP}</div>
          <Progress className="mt-3" value={Math.min((unit.Total_HP / 1500) * 100, 100)} />
        </Card>

        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sensor Health</span>
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {badSensorsCount === 0 ? (
              <Badge className="bg-emerald-600 text-white">All Good</Badge>
            ) : (
              <Badge className="bg-amber-500 text-white">{badSensorsCount} Issue(s)</Badge>
            )}
          </div>
        </Card>

        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Alarms</span>
            <BatteryWarning className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            {activeAlarms.length === 0 ? (
              <Badge variant="secondary">No Active Alarms</Badge>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeAlarms.map((a) => (
                  <Badge key={a} className="bg-red-600 text-white">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top 3 Problem Cylinders */}
      <Card className="p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold">Top Problematic Cylinders</h2>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map(({ key, score, c }) => {
            const he = c.head_end || {};
            const ce = c.crank_end || {};
            const hpSum = (he.HP || 0) + (ce.HP || 0);
            const disMax = Math.max(he.Discharge_Pressure_psi || 0, ce.Discharge_Pressure_psi || 0);
            const sucMin = Math.min(he.Suction_Pressure_psi || 999, ce.Suction_Pressure_psi || 999);
            const ve = Math.min(he.Vol_Eff_Discharge_pct || 0, ce.Vol_Eff_Discharge_pct || 0);

            return (
              <Card key={key} className="p-4 rounded-2xl border border-border/60">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{key.replace("cylinder_", "Cylinder ")}</div>
                  {statusBadge(score)}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground">Total HP</div>
                    <div className="font-semibold">{hpSum.toFixed(1)}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground">Discharge Max</div>
                    <div className="font-semibold">{disMax} psi</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground">Suction Min</div>
                    <div className="font-semibold">{sucMin === 999 ? "-" : `${sucMin} psi`}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground">Vol. Eff (min)</div>
                    <div className="font-semibold">{ve}%</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
                  <Progress value={Math.min(score * 12.5, 100)} />
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

    
      {/* Charts */}
{/* Charts */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Cylinder HP Comparison */}
  <Card className="p-4 rounded-2xl">
    <h3 className="text-lg font-semibold mb-4 text-center">Cylinder HP Comparison (HE vs CE)</h3>
    <Chart
      type="bar"
      height={360}
      series={[
        { name: "Head End HP", data: seriesHP_HE },
        { name: "Crank End HP", data: seriesHP_CE },
      ]}
      options={{
        chart: {
          type: "bar",
          toolbar: { show: false },
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 900,
            dynamicAnimation: { speed: 700 },
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "40%",
            borderRadius: 10, // Rounded bars only on top
            borderRadiusApplication: "end", // ✅ Only top edges rounded
            dataLabels: {
              position: "top",
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val} HP`,
          offsetY: -18,
          style: {
            fontSize: "12px",
            fontWeight: "bold",
            colors: ["var(--color-foreground)"],
          },
        },
        colors: ["var(--chart-3)", "var(--chart-4)"], // ✅ Using global colors
        xaxis: {
          categories: chartCats,
          labels: {
            style: {
              colors: "var(--color-muted-foreground)",
              fontWeight: 500,
            },
          },
        },
        yaxis: {
          title: {
            text: "Horsepower (HP)",
            style: { color: "var(--color-foreground)" },
          },
          labels: { style: { colors: "var(--color-muted-foreground)" } },
        },
        grid: {
          borderColor: "var(--color-border)",
          strokeDashArray: 4,
        },
        legend: {
          position: "top",
          horizontalAlign: "center",
          labels: { colors: "var(--color-foreground)" },
          markers: { width: 16, height: 16, radius: 4 },
        },
        tooltip: {
          theme: "dark",
          y: {
            formatter: (val) => `${val} HP`,
          },
        },
      }}
    />
  </Card>

  {/* Suction vs Discharge */}
  <Card className="p-4 rounded-2xl">
    <h3 className="text-lg font-semibold mb-4 text-center">Suction vs Discharge (Head End)</h3>
    <Chart
      type="bar"
      height={360}
      series={[
        { name: "Suction (psi)", data: seriesSuc }, // ✅ Swapped order
        { name: "Discharge (psi)", data: seriesDis },
      ]}
      options={{
        chart: {
          type: "bar",
          stacked: true,
          toolbar: { show: false },
          animations: {
            enabled: true,
            easing: "easeout",
            speed: 800,
            dynamicAnimation: { speed: 600 },
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "45%",
            borderRadius: 10, // Rounded bars only on top
            borderRadiusApplication: "end", // ✅ Only top edges rounded
            dataLabels: {
              position: "center",
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val} psi`,
          style: {
            fontSize: "11px",
            fontWeight: "600",
            colors: ["var(--color-foreground)"],
          },
        },
        colors: ["var(--chart-1)", "var(--chart-2)"], // ✅ Using global colors
        xaxis: {
          categories: chartCats,
          labels: {
            style: {
              colors: "var(--color-muted-foreground)",
              fontWeight: 500,
            },
          },
        },
        yaxis: {
          title: {
            text: "Pressure (psi)",
            style: { color: "var(--color-foreground)" },
          },
          labels: { style: { colors: "var(--color-muted-foreground)" } },
        },
        grid: {
          borderColor: "var(--color-border)",
          strokeDashArray: 4,
        },
        legend: {
          position: "top",
          labels: { colors: "var(--color-foreground)" },
          markers: { width: 16, height: 16, radius: 4 },
        },
        tooltip: {
          theme: "dark",
          shared: true,
          intersect: false,
          y: {
            formatter: (val) => `${val} psi`,
          },
        },
      }}
    />
  </Card>
</div>



       {/* Stage Performance */}
      <Card className="p-4 rounded-2xl">
        <h2 className="text-lg font-semibold mb-3">Stage Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">Stage</th>
                <th className="p-2 text-center">Flow (MMSCFD)</th>
                <th className="p-2 text-center">Suction (psi)</th>
                <th className="p-2 text-center">Discharge (psi)</th>
                <th className="p-2 text-center">Suction Temp (°F)</th>
                <th className="p-2 text-center">Discharge Temp (°F)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stages).map(([stage, s]) => (
                <tr key={stage} className="border-t border-border">
                  <td className="p-2">{stage.replace("_", " ").toUpperCase()}</td>
                  <td className="p-2 text-center">{s.Flow_MMSCFD}</td>
                  <td className="p-2 text-center">{s.Avg_Suction_Pressure_psi}</td>
                  <td className="p-2 text-center">{s.Avg_Discharge_Pressure_psi}</td>
                  <td className="p-2 text-center">{s.Avg_Suction_Temp_F}</td>
                  <td className="p-2 text-center">{s.Avg_Discharge_Temp_F}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
