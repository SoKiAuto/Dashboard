"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gauge } from "lucide-react";

export default function CPMUnitOverviewTile({ unit, timestamp }) {
  const items = [
    { label: "Unit RPM", value: unit?.Unit_RPM, suffix: " RPM" },
    { label: "Total HP", value: unit?.Total_HP, suffix: " HP" },
    { label: "Avg Discharge Temp", value: unit?.Avg_Discharge_Temp_F, suffix: " °F" },
    { label: "Avg Suction Temp", value: unit?.Avg_Suction_Temp_F, suffix: " °F" },
  ];

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Gauge className="w-5 h-5 text-emerald-600" />
          Unit Overview
        </CardTitle>
        {timestamp && (
          <div className="text-xs text-muted-foreground">
            Updated: {new Date(timestamp).toLocaleString()}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((i) => (
            <div key={i.label} className="p-3 rounded-lg bg-muted/40">
              <div className="text-xs text-muted-foreground">{i.label}</div>
              <div className="text-lg font-semibold">
                {i.value ?? "—"}
                {i.value != null ? i.suffix : ""}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
