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

export default function MetricChart({ channel, liveData, setpoints }) {
  const [history, setHistory] = useState([]);
  const [range, setRange] = useState("1h");

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/vm/history?channel=${channel}&range=${range}`);
      const data = await res.json();
      setHistory(data.reverse()); // Oldest first
    } catch (e) {
      console.error("Chart error:", e);
    }
  };

  useEffect(() => {
    fetchHistory();

    if (range === "live") {
      const interval = setInterval(() => {
        fetchHistory();
      }, 3000); // every 3s
      return () => clearInterval(interval);
    }
  }, [channel, range]);

  const overallRMS = liveData?.values?.Overall_RMS ?? 0;
  const thresholds = setpoints?.Overall_RMS ?? {};
  const color = overallRMS >= thresholds.alarm ? "bg-red-600"
              : overallRMS >= thresholds.warning ? "bg-yellow-500"
              : "bg-green-600";

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Overall RMS</h2>
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
        Live RMS: {overallRMS}
      </Badge>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={history.map(item => ({
            value: item.values?.Overall_RMS,
            time: new Date(item.timestamp).toLocaleTimeString(),
            originalTime: item.timestamp,
          }))}
        >
          <XAxis dataKey="time" fontSize={10} />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          {thresholds.warning && (
            <ReferenceLine y={thresholds.warning} label="Warning" stroke="orange" strokeDasharray="4 2" />
          )}
          {thresholds.alarm && (
            <ReferenceLine y={thresholds.alarm} label="Alarm" stroke="red" strokeDasharray="4 2" />
          )}
          {thresholds.baseline && (
            <ReferenceLine y={thresholds.baseline} label="Baseline" stroke="gray" strokeDasharray="2 2" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
