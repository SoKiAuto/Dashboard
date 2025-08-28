"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { useParams } from "next/navigation";

export default function RPMStabilityChart() {
  const [data, setData] = useState([]);
  const { channel } = useParams();

  useEffect(() => {
    if (!channel) return;

    const fetchRPM = async () => {
      try {
        const res = await fetch(`/api/vm/history?channel=${channel}`);
        const json = await res.json();

        const raw = Array.isArray(json) ? json : json.data ?? [];

        const formatted = raw.map((d) => ({
          time: format(new Date(d.timestamp), "HH:mm"),
          rpm: d.values?.RPM ?? null, // assumes your MongoDB uses values.RPM
        })).filter(d => d.rpm !== null); // remove entries with missing RPM

        setData(formatted);
      } catch (err) {
        console.error("Error fetching RPM history", err);
      }
    };

    fetchRPM();
    const interval = setInterval(fetchRPM, 15000);
    return () => clearInterval(interval);
  }, [channel]);

  const mean = data.length ? Math.round(data.reduce((sum, d) => sum + d.rpm, 0) / data.length) : null;

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">🌀 RPM Stability</h2>
      {data.length > 0 && mean ? (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Line type="monotone" dataKey="rpm" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <ReferenceLine y={mean} stroke="#10b981" strokeDasharray="3 3" label="Mean" />
            <ReferenceLine y={mean * 1.05} stroke="#ef4444" strokeDasharray="2 4" label="+5%" />
            <ReferenceLine y={mean * 0.95} stroke="#ef4444" strokeDasharray="2 4" label="-5%" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-gray-500 dark:text-gray-400">Loading RPM data...</div>
      )}
    </div>
  );
}
