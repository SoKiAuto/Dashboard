"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import { Badge } from "@/components/ui/badge";

const ranges = [
  { label: "Live", value: "live" },
  { label: "15 min", value: "15min" },
  { label: "1 hour", value: "1h" },
  { label: "6 hours", value: "6h" },
  { label: "24 hours", value: "24h" },
  { label: "7 days", value: "7d" }
];

// ✅ Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const dateObj = new Date(dataPoint.originalTime);
    return (
      <div className="bg-white border rounded shadow-md p-2 text-sm">
        <div><strong>Value:</strong> {payload[0].value?.toFixed(2)}</div>
        <div><strong>Time:</strong> {dateObj.toLocaleTimeString()}</div>
        <div><strong>Date:</strong> {dateObj.toLocaleDateString()}</div>
      </div>
    );
  }
  return null;
};

export default function FFTRMSChart({ channel, liveData, setpoints }) {
  const [history, setHistory] = useState([]);
  const [range, setRange] = useState("1h");

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/vm/history?channel=${channel}&metrics=FFT_RMS&range=${range}`);
      const data = await res.json();
      setHistory(data.reverse());
    } catch (err) {
      console.error("FFT RMS Chart error:", err);
    }
  };

  useEffect(() => {
    fetchHistory();

    if (range === "live") {
      const interval = setInterval(() => {
        fetchHistory();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [channel, range]);

  const value = liveData?.values?.FFT_RMS ?? 0;
  const thresholds = setpoints?.FFT_RMS ?? {};
  const color = value >= thresholds.alarm ? "bg-red-600"
              : value >= thresholds.warning ? "bg-yellow-500"
              : "bg-green-600";

  const chartData = history.map(item => ({
    value: item?.values?.FFT_RMS ?? 0,
    time: new Date(item.timestamp).toLocaleTimeString(),
    originalTime: item.timestamp,
  }));

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">FFT RMS</h2>
        <div className="flex gap-2">
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`text-xs px-2 py-1 border rounded ${range === r.value ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Badge className={`${color} text-white`}>
        Live: {value}
      </Badge>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="time" fontSize={10} />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          {thresholds.warning && (
            <ReferenceLine y={thresholds.warning} stroke="orange" strokeDasharray="4 2" label="Warning" />
          )}
          {thresholds.alarm && (
            <ReferenceLine y={thresholds.alarm} stroke="red" strokeDasharray="4 2" label="Alarm" />
          )}
          {thresholds.baseline && (
            <ReferenceLine y={thresholds.baseline} stroke="gray" strokeDasharray="2 2" label="Baseline" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
