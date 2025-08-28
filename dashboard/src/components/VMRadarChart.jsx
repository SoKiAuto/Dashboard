"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const metricColors = {
  Overall_RMS: "rgba(255, 99, 132, 0.5)",
  Waveform_RMS: "rgba(54, 162, 235, 0.5)",
  FFT_RMS: "rgba(255, 206, 86, 0.5)",
  RodDrop_RMS: "rgba(75, 192, 192, 0.5)",
  RodDrop_Min: "rgba(153, 102, 255, 0.5)",
  RodDrop_Max: "rgba(255, 159, 64, 0.5)",
  RodDrop_PkPk: "rgba(201, 203, 207, 0.5)",
};

const allMetrics = {
  group1: ["Overall_RMS", "Waveform_RMS", "FFT_RMS"],
  group2: [
    "Overall_RMS",
    "Waveform_RMS",
    "FFT_RMS",
    "RodDrop_RMS",
    "RodDrop_Min",
    "RodDrop_Max",
    "RodDrop_PkPk",
  ],
};

export default function VMRadarChart() {
  const { resolvedTheme } = useTheme(); // Get current theme
  const [liveData, setLiveData] = useState([]);
  const [metrics1, setMetrics1] = useState(["Overall_RMS"]);
  const [metrics2, setMetrics2] = useState(["Overall_RMS"]);

  useEffect(() => {
  let intervalId;

  const fetchData = async () => {
    try {
      const res = await fetch("/api/vm/live");
      const data = await res.json();
      setLiveData(data);
    } catch (error) {
      console.error("Error fetching VM live data:", error);
    }
  };

  fetchData(); // Initial fetch
  intervalId = setInterval(fetchData, 5000); // Re-fetch every 5 sec

  return () => clearInterval(intervalId); // Cleanup on unmount
}, []);


  const getRadarData = (channels, selectedMetrics) => {
    const labels = channels.map((ch) => `Ch-${ch.channel}`);
    const datasets = selectedMetrics.map((metric) => ({
      label: metric.replace(/_/g, " "),
      data: channels.map((ch) => ch.values[metric] || 0),
      backgroundColor: metricColors[metric],
      borderColor: metricColors[metric].replace("0.5", "1"),
      borderWidth: 1,
      fill: true,
    }));
    return { labels, datasets };
  };

  const isDark = resolvedTheme === "dark";

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        angleLines: { color: isDark ? "hsl(240, 3%, 30%)" : "hsl(240, 3%, 80%)" },
        grid: { color: isDark ? "hsl(240, 3%, 35%)" : "hsl(240, 3%, 85%)" },
        pointLabels: {
          color: isDark ? "oklch(0.9 0.01 240)" : "oklch(0.3 0.01 240)",
          font: { size: 14 },
        },
        ticks: {
          color: isDark ? "oklch(0.8 0.01 240)" : "oklch(0.4 0.01 240)",
          backdropColor: "transparent",
          beginAtZero: true,
          
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: isDark ? "oklch(0.85 0 0)" : "oklch(0.25 0 0)",
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "oklch(0.15 0.02 240)" : "oklch(0.97 0 0)",
        titleColor: isDark ? "#fff" : "#000",
        bodyColor: isDark ? "#fff" : "#000",
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue}`,
        },
      },
    },
  };

  const channels1to8 = liveData.filter((ch) => ch.channel >= 1 && ch.channel <= 8);
  const channels9to12 = liveData.filter((ch) => ch.channel >= 9 && ch.channel <= 12);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Channels 1–8 Radar */}
      <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
        <h2 className="text-lg font-semibold mb-4 text-primary">Channels 1–8</h2>

        <ToggleGroup
          type="multiple"
          value={metrics1}
          onValueChange={setMetrics1}
          className="mb-4"
        >
          {allMetrics.group1.map((m) => (
            <ToggleGroupItem key={m} value={m}>
              {m.replace(/_/g, " ")}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Radar data={getRadarData(channels1to8, metrics1)} options={radarOptions} />
      </div>

      {/* Channels 9–12 Radar */}
      <div className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border">
        <h2 className="text-lg font-semibold mb-4 text-primary">Channels 9–12</h2>

        <ToggleGroup
          type="multiple"
          value={metrics2}
          onValueChange={setMetrics2}
          className="mb-4"
        >
          {allMetrics.group2.map((m) => (
            <ToggleGroupItem key={m} value={m}>
              {m.replace(/_/g, " ")}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Radar data={getRadarData(channels9to12, metrics2)} options={radarOptions} />
      </div>
    </div>
  );
}
