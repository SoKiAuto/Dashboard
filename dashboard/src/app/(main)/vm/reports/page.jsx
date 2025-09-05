"use client";
import ReportGenerator from "@/components/ReportGenerator";

export default function VMReportPage() {
  const vmMetrics = [
    { value: "velocity_mm_s", label: "Velocity (mm/s)" },
    { value: "acceleration_g", label: "Acceleration (g)" },
    { value: "temperature_c", label: "Temperature (°C)" },
    { value: "frequency_hz", label: "Frequency (Hz)" },
  ];

  return (
    <ReportGenerator
      type="vm"
      apiUrl="/api/vm/history"
      metricsOptions={vmMetrics}
    />
  );
}
