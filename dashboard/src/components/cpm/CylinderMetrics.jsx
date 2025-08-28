"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const metricsConfig = [
  { key: "HP", label: "Horsepower", suffix: "", max: 1000 },
  { key: "Discharge_Pressure_psi", label: "Discharge Pressure", suffix: " psi", max: 500 },
  { key: "Suction_Pressure_psi", label: "Suction Pressure", suffix: " psi", max: 300 },
  { key: "Cylinder_Flow_MMSCFD", label: "Flow", suffix: " MMSCFD", max: 50 },
  { key: "Clearance_pct", label: "Clearance", suffix: "%", max: 100 },
];

export default function CylinderMetrics({ data }) {
  const he = data?.head_end || {};
  const ce = data?.crank_end || {};

  return (
    <Card className="p-6 rounded-2xl shadow-lg border border-border bg-card">
      <h3 className="text-xl font-semibold mb-6 text-center">
        Cylinder Metrics Comparison
      </h3>

      <div className="space-y-6">
        {metricsConfig.map((metric) => {
          const heValue = Number(he?.[metric.key]) || 0;
          const ceValue = Number(ce?.[metric.key]) || 0;

          const hePercent = Math.min((heValue / metric.max) * 100, 100);
          const cePercent = Math.min((ceValue / metric.max) * 100, 100);

          return (
            <div key={metric.key} className="flex flex-col">
              <div className="flex justify-center text-sm  text-secondary-foreground mb-0 ">
                {metric.label}
              </div>

              <div className="flex items-center w-full gap-2">
                {/* Head End Bar */}
                <div className="relative flex-1 flex justify-end">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${hePercent}%` }}
                    transition={{ duration: 0.7 }}
                    className="h-4 bg-gradient-to-l from-blue-500 to-blue-300 rounded-l-lg"
                  />
                  <span className="absolute right-8 -top-6 text-xs font-semibold text-blue-600 ">
                    {heValue} {metric.suffix}
                  </span>
                </div>

                {/* Center Divider */}
               <div className="w-18 text-center text-sm text-secondary-foreground font-medium">
                    HE / CE
                    </div>



                {/* Crank End Bar */}
                <div className="relative flex-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cePercent}%` }}
                    transition={{ duration: 0.7 }}
                    className="h-4 bg-gradient-to-r from-emerald-500 to-green-300 rounded-r-lg"
                  />
                  <span className="absolute left-8 -top-6 text-xs font-semibold text-emerald-600">
                    {ceValue} {metric.suffix}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
