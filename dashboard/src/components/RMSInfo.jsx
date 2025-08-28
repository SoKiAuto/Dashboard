// ✅ dashboard/src/components/RMSInfo.jsx

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";

export default function RMSInfo({ value = 0 }) {
  let status = "Normal";
  let statusColor = "text-green-600";

  if (value > 5 && value <= 10) {
    status = "Warning";
    statusColor = "text-yellow-500";
  } else if (value > 10) {
    status = "Critical";
    statusColor = "text-red-600";
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Info className="h-5 w-5" /> RMS Diagnostic Overview
        </h2>

        <div className="text-sm">
          <p>
            <strong>Primary health indicator:</strong> If RMS increases beyond a threshold, it usually signals wear,
            imbalance, looseness, or emerging faults.
          </p>
          <p>
            <strong>Alarm triggers:</strong> Set warning and alarm thresholds for early fault detection.
          </p>
          <p>
            <strong>Trend monitoring:</strong> Watch RMS trends over days/weeks to detect gradual deterioration before a
            failure happens.
          </p>
          <p>
            <strong>Baseline setting:</strong> Establish normal RMS levels per machine and channel during healthy
            operation for comparisons.
          </p>
          <Separator />
          <p>
            <strong>Example:</strong> If bearing RMS goes from <code>0.3 g</code> to <code>1.2 g</code> over a week, it
            indicates bearing wear or damage.
          </p>
        </div>

        <Separator />

        <div className="text-sm">
          <p>
            <strong>Current RMS:</strong> {value.toFixed(2)} g
          </p>
          <p className={statusColor}>
            <strong>Status:</strong> {status}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
