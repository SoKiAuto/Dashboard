"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function TrendChart({ data = [], metric = "Overall_RMS" }) {
  const labels = data.map((d) =>
    new Date(d.timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );

  const values = data.map((d) => d.values[metric]);

  const chartData = {
    labels,
    datasets: [
      {
        label: metric,
        data: values,
        fill: false,
        borderColor: "#4F46E5",
        backgroundColor: "#6366F1",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#555" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#888" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#888" },
      },
    },
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-4">
      <CardHeader className="font-semibold text-xl">
        Channel 1 – {metric.replace(/_/g, " ")} Trend
      </CardHeader>
      <CardContent>
        <Line data={chartData} options={options} />
      </CardContent>
    </Card>
  );
}
