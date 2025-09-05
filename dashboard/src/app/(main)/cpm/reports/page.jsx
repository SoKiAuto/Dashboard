"use client";
import ReportGenerator from "@/components/ReportGenerator";

export default function CPMReportPage() {
  const cpmMetrics = [
    { value: "Avg_Suction_Pressure_psi", label: "Avg Suction Pressure (psi)" },
    { value: "Avg_Discharge_Pressure_psi", label: "Avg Discharge Pressure (psi)" },
    { value: "Temperature_C", label: "Temperature (°C)" },
    { value: "Vibration_mm", label: "Vibration (mm)" },
  ];

  return (
    <ReportGenerator
      type="cpm"
      apiUrl="/api/cpm/history"
      metricsOptions={cpmMetrics}
    />
  );
}
