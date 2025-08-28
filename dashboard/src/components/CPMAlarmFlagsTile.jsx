"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link"; 

function Dot({ active = false, label }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block w-3 h-3 rounded-full ${
          active ? "bg-red-500" : "bg-green-500"
        }`}
        aria-label={active ? "on" : "off"}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function CPMAlarmFlagsTile({ unit }) {
  // structured per-cylinder flags from backend decoder
  const sensor = unit?.Sensor_Bad_Flag || {};
  const alarms = unit?.Alarm_Bits || {};

  const cylKeys = Array.from(
    new Set([
      ...Object.keys(sensor || {}),
      ...Object.keys(alarms || {}),
    ])
  ).sort((a, b) => {
    const ai = parseInt(a.split("_")[1] || "0", 10);
    const bi = parseInt(b.split("_")[1] || "0", 10);
    return ai - bi;
  });

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Sensor / Alarm Flags
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          <span className="mr-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
            OK
          </span>
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
            Active
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cylKeys.map((key) => {
            const s = sensor[key] || {};
            const a = alarms[key] || {};
            return (
              <div key={key} className="p-3 rounded-lg border bg-background">
               <Link
                href={`/cpm/${key}`}
                className="text-sm font-semibold mb-2 capitalize text-primary hover:underline"
                >
                {key.replace("_", " ")}
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-medium mb-1">Sensor Bad</div>
                    <div className="flex flex-col gap-1">
                      <Dot active={!!s.head_end} label="Head End" />
                      <Dot active={!!s.crank_end} label="Crank End" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-1">Alarm</div>
                    <div className="flex flex-col gap-1">
                      <Dot active={!!a.head_end} label="Head End" />
                      <Dot active={!!a.crank_end} label="Crank End" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {cylKeys.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No flags available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
