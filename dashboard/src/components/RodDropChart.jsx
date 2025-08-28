"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { Badge } from "@/components/ui/badge";

const ranges = [
  { label: "Live", value: "live" },
  { label: "15 min", value: "15min" },
  { label: "1 hour", value: "1h" },
  { label: "6 hours", value: "6h" },
  { label: "24 hours", value: "24h" },
  { label: "7 days", value: "7d" },
];

const metricKeys = [
  "RodDrop_RMS",
  "RodDrop_PkPk",
  "RodDrop_Min",
  "RodDrop_Max"
];

const colors = {
  RodDrop_RMS: "#3b82f6",
  RodDrop_PkPk: "#ef4444",
  RodDrop_Min: "#10b981",
  RodDrop_Max: "#f59e0b"
};

export default function RodDropChart({ channel }) {
  const [history, setHistory] = useState([]);
  const [range, setRange] = useState("1h");

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `/api/vm/history?channel=${channel}&metrics=${metricKeys.join(",")}&range=${range}`
      );
      const data = await res.json();
      setHistory(data.reverse());
    } catch (err) {
      console.error("RodDropChart error:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    if (range === "live") {
      const interval = setInterval(fetchHistory, 3000);
      return () => clearInterval(interval);
    }
  }, [channel, range]);

  const formattedData = history.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    ...item.values
  }));

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rod Drop Metrics</h2>
        <div className="flex gap-2">
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`text-xs px-2 py-1 border rounded ${
                range === r.value ? "bg-blue-500 text-white" : "bg-white text-black"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {metricKeys.map(key => (
          <Badge key={key} className="bg-gray-200 text-black">
            {key}: {history.at(-1)?.values?.[key]?.toFixed(2) ?? "N/A"}
          </Badge>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <XAxis dataKey="time" fontSize={10} />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload?.length) {
                        const fullDate = history.find(
                          (h) => new Date(h.timestamp).toLocaleTimeString() === label
                        )?.timestamp;

                        const formattedDate = fullDate
                          ? new Date(fullDate).toLocaleString()
                          : label;

                        return (
                          <div className="bg-white p-2 border rounded shadow text-sm">
                            <div className="font-semibold text-gray-700">{formattedDate}</div>
                            {payload.map((entry, i) => (
                              <div key={i} className="text-gray-800">
                                <span className="font-medium">{entry.name}</span>:{" "}
                                <span>{entry.value?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }     
                      return null;
                    }}
                  />

          <Legend />
          {metricKeys.map(key => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[key]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
