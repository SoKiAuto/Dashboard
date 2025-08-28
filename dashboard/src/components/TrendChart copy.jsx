"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function TrendChart({ data }) {
  if (!data?.length) return <p>No data available.</p>;

  const sorted = [...data].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sorted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) =>
              new Date(value).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            }
          />
          <YAxis />
          <Tooltip labelFormatter={(v) => new Date(v).toLocaleString()} />
          <Legend />
          <Line
            type="monotone"
            dataKey="values.Overall_RMS"
            stroke="#22c55e"
            name="Overall RMS"
          />
          <Line
            type="monotone"
            dataKey="values.Bias_Voltage"
            stroke="#3b82f6"
            name="Bias Voltage"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
