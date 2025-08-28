"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const timeOptions = [
  { label: "15 min", minutes: 15 },
  { label: "1 hr", minutes: 60 },
  { label: "6 hr", minutes: 360 },
  { label: "24 hr", minutes: 1440 },
  { label: "7 days", minutes: 10080 },
];

export default function RPMChart({ channel, liveData }) {
  const [history, setHistory] = useState([]);
  const [selectedRange, setSelectedRange] = useState(1440); // default 24 hrs

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const to = new Date();
        const from = new Date(to.getTime() - selectedRange * 60 * 1000);

        const res = await fetch(
          `/api/vm/history?channel=${channel}&metrics=RPM&from=${from.toISOString()}&to=${to.toISOString()}`
        );
        const data = await res.json();
        setHistory(data.reverse());
      } catch (err) {
        console.error("RPM Chart error:", err);
      }
    };

    fetchHistory();
  }, [channel, selectedRange]);

  const rpm = liveData?.RPM ?? 0;

  const chartData = history.map((item) => ({
    value: item?.values?.RPM ?? 0,
    time: new Date(item.timestamp).toLocaleTimeString(),
  }));

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Machine RPM</h2>
        <Badge className="bg-blue-600 text-white">{rpm} RPM</Badge>
      </div>

      <div className="flex gap-2 flex-wrap">
        {timeOptions.map((opt) => (
          <button
            key={opt.label}
            className={`px-2 py-1 border rounded ${
              selectedRange === opt.minutes
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 border-blue-600"
            }`}
            onClick={() => setSelectedRange(opt.minutes)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="time" fontSize={10} />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
