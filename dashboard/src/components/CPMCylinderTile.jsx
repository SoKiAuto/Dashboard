"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SplitSquareHorizontal } from "lucide-react";

function MetricRow({ label, value, suffix }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">
        {value ?? "—"}
        {value != null ? ` ${suffix || ""}` : ""}
      </span>
    </div>
  );
}

export default function CPMCylinderTile({ name, data }) {
  const he = data?.head_end || {};
  const ce = data?.crank_end || {};

  return (
    <Link href={`/cpm/${name}`} className="block hover:scale-[1.02] transition-transform">
      <Card className="shadow-sm cursor-pointer hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <SplitSquareHorizontal className="w-5 h-5 text-sky-600" />
            <span className="capitalize">{name.replace("_", " ")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* HE & CE core metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/40">
              <div className="text-xs font-medium mb-2">Head End</div>
              <div className="space-y-2">
                <MetricRow label="HP" value={he?.HP} />
                <MetricRow label="Discharge Pressure" value={he?.Discharge_Pressure_psi} suffix="psi" />
                <MetricRow label="Suction Pressure" value={he?.Suction_Pressure_psi} suffix="psi" />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/40">
              <div className="text-xs font-medium mb-2">Crank End</div>
              <div className="space-y-2">
                <MetricRow label="HP" value={ce?.HP} />
                <MetricRow label="Discharge Pressure" value={ce?.Discharge_Pressure_psi} suffix="psi" />
                <MetricRow label="Suction Pressure" value={ce?.Suction_Pressure_psi} suffix="psi" />
              </div>
            </div>
          </div>

          {/* Common cylinder metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border bg-background">
              <div className="text-xs text-muted-foreground">Crosshead Pin Reversal</div>
              <div className="text-lg font-semibold">
                {data?.Crosshead_Pin_Reversal_Deg ?? "—"}
                {data?.Crosshead_Pin_Reversal_Deg != null ? " °" : ""}
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-background">
              <div className="text-xs text-muted-foreground">Rod Load Tension</div>
              <div className="text-lg font-semibold">
                {data?.Rod_Load_Tension_kLbf ?? "—"}
                {data?.Rod_Load_Tension_kLbf != null ? " k-lbf" : ""}
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-background">
              <div className="text-xs text-muted-foreground">Rod Load Compression</div>
              <div className="text-lg font-semibold">
                {data?.Rod_Load_Compression_kLbf ?? "—"}
                {data?.Rod_Load_Compression_kLbf != null ? " k-lbf" : ""}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
