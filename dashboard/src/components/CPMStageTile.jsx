"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Layers } from "lucide-react";

/**
 * Simple stage tile that shows all provided metrics (as-is).
 * Expected keys:
 * - Flow_MMSCFD
 * - Avg_Suction_Pressure_psi
 * - Avg_Discharge_Pressure_psi
 * - Avg_Suction_Temp_F
 * - Avg_Discharge_Temp_F
 */
export default function CPMStageTile({ name, data }) {
  const rows = [
    { label: "Flow", value: data?.Flow_MMSCFD, suffix: " MMSCFD" },
    { label: "Avg Suction Pressure", value: data?.Avg_Suction_Pressure_psi, suffix: " psi" },
    { label: "Avg Discharge Pressure", value: data?.Avg_Discharge_Pressure_psi, suffix: " psi" },
    { label: "Avg Suction Temp", value: data?.Avg_Suction_Temp_F, suffix: " °F" },
    { label: "Avg Discharge Temp", value: data?.Avg_Discharge_Temp_F, suffix: " °F" },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          <span className="capitalize">{name.replace("_", " ")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/40">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="font-semibold">
              {r.value ?? "—"}
              {r.value != null ? r.suffix : ""}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
