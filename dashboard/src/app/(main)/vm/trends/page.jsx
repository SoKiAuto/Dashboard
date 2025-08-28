"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Chart = dynamic(() => import("@/components/TrendChart"), { ssr: false });

const channelsList = [1, 2, 3, 4, 5, 6, 7, 8];
const metrics = [
  { label: "Overall RMS", value: "Overall_RMS" },
  { label: "Waveform RMS", value: "Waveform_RMS" },
  { label: "FFT RMS", value: "FFT_RMS" },
  { label: "Bias Voltage", value: "Bias_Voltage" },
  { label: "RPM", value: "RPM" },
];

export default function VMDashboard() {
  const [selectedChannels, setSelectedChannels] = useState([1, 2, 3]);
  const [selectedMetric, setSelectedMetric] = useState("Overall_RMS");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const toggleChannel = (ch) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const setQuickRange = (days = 0, hours = 0) => {
    const to = new Date();
    const from = new Date();
    from.setHours(to.getHours() - hours);
    from.setDate(from.getDate() - days);
    setCustomFrom(from.toISOString().slice(0, 16));
    setCustomTo(to.toISOString().slice(0, 16));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        selectedChannels.map(async (ch) => {
          const query = new URLSearchParams();
          if (customFrom) query.append("from", new Date(customFrom).toISOString());
          if (customTo) query.append("to", new Date(customTo).toISOString());

          const res = await fetch(`/api/vm/history?channel=${ch}&${query.toString()}`);
          const json = await res.json();

          return {
            channel: ch,
            data: json.map((point) => ({
              timestamp: new Date(point.timestamp).toISOString(),
              value:
                selectedMetric === "RPM"
                  ? point.RPM
                  : point.values?.[selectedMetric] ?? null,
              RPM: point.RPM,
              values: point.values,
            })),
          };
        })
      );

      const timeMap = {};
      results.forEach(({ channel, data }) => {
        data.forEach(({ timestamp, value, RPM, values }) => {
          if (!timeMap[timestamp]) {
            timeMap[timestamp] = { timestamp, RPM, values: {} };
          }
          timeMap[timestamp][`CH${channel}`] = value;
          if (!timeMap[timestamp].RPM) timeMap[timestamp].RPM = RPM;
          if (!timeMap[timestamp].values) timeMap[timestamp].values = values;
        });
      });

      const combined = Object.values(timeMap).sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      setChartData(combined);
    } catch (err) {
      console.error("❌ Error fetching chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedChannels, selectedMetric, customFrom, customTo]);

  return (
    <div className="p-8 space-y-4 min-h-screen w-full">
      {/* Top bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-4">
          <WrenchScrewdriverIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <label className="font-semibold mr-2">Channel Selector</label>
            <div className="inline-flex gap-3 ml-2">
              {channelsList.map((ch) => (
                <label key={ch} className="text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes(ch)}
                    onChange={() => toggleChannel(ch)}
                    className="mr-1"
                  />
                  CH{ch}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="font-semibold mr-2 p-8">
            <ChartBarIcon className="h-5 w-5 inline-block mr-1 text-muted-foreground" />
            Parameter:
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-border rounded px-4 py-1"
          >
            {metrics.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold mr-2">
            <ClockIcon className="h-5 w-5 inline-block mr-1 text-muted-foreground" />
            Date Range:
          </label>
          <input
            type="datetime-local"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="border border-border rounded px-2 py-1 mr-2"
          />
          <input
            type="datetime-local"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="border border-border rounded px-2 py-1"
          />

          <div className="mt-2 flex gap-2 text-sm">
            <button
              onClick={() => setQuickRange(0, 1)} // ✅ Last 1h
              className="px-2 py-1 border rounded hover:bg-muted transition"
            >
              Last 1h
            </button>
            <button
              onClick={() => setQuickRange(1)}
              className="px-2 py-1 border rounded hover:bg-muted transition"
            >
              Last 24h
            </button>
            <button
              onClick={() => setQuickRange(7)}
              className="px-2 py-1 border rounded hover:bg-muted transition"
            >
              Last 1 Week
            </button>
            <button
              onClick={() => setQuickRange(30)}
              className="px-2 py-1 border rounded hover:bg-muted transition"
            >
              1 Month
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : (
        <Chart data={chartData} channels={selectedChannels} metric={selectedMetric} />
      )}
    </div>
  );
}
