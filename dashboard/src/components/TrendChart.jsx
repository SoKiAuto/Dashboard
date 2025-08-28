import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Dot,
} from "recharts";
import { ChartBarIcon } from "@heroicons/react/24/outline";

const formatTime = (iso) => new Date(iso).toLocaleTimeString();

function detectSpikes(data, channels, metric) {
  const values = [];

  data.forEach((point) => {
    channels.forEach((ch) => {
      const val = point[`CH${ch}`];
      if (typeof val === "number") values.push(val);
    });
  });

  if (values.length === 0) return new Set();

  const mean =
    values.reduce((acc, v) => acc + v, 0) / values.length;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  const stddev = Math.sqrt(variance);

  const threshold = mean + 1.5 * stddev;

  const spikeTimestamps = new Set();

  data.forEach((point) => {
    channels.forEach((ch) => {
      const val = point[`CH${ch}`];
      if (typeof val === "number" && val > threshold) {
        spikeTimestamps.add(point.timestamp);
      }
    });
  });

  return spikeTimestamps;
}

const colors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "#8a2be2",
  "#e07b7b",
  "#7be0a8",
];

const getUnit = (metric) => {
  if (!metric) return "";
  if (metric.includes("voltage")) return "V";
  if (metric.includes("rpm")) return "rpm";
  if (metric.includes("rms")) return "V";
  return "";
};

export default function TrendChart({ data, channels, metric }) {
  const [clickedPoint, setClickedPoint] = useState(null);
  const [showSpikes, setShowSpikes] = useState(true); // <-- NEW: control spike visibility

  const spikes = useMemo(() => detectSpikes(data, channels, metric), [data, channels, metric]);

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;

    if (showSpikes && spikes.has(payload.timestamp)) {
      return <circle cx={cx} cy={cy} r={5} fill="red" stroke="none" />;
    }

    return <Dot {...props} />;
  };

  const unit = getUnit(metric);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-2 rounded shadow"
          style={{ minWidth: 200 }}
        >
          <div className="font-semibold mb-1">{new Date(label).toLocaleString()}</div>
          {payload.map((pld) => (
            <div key={pld.dataKey} style={{ color: pld.stroke }}>
              <strong>{pld.name}:</strong> {pld.value?.toFixed(3)} {unit}{" "}
              (CH{pld.dataKey.replace("CH", "")})
            </div>
          ))}
          {clickedPoint && clickedPoint.timestamp === label && (
            <>
              <hr className="my-1 border-gray-300 dark:border-gray-600" />
              <div><strong>RPM:</strong> {clickedPoint.RPM}</div>
              <div><strong>Voltage:</strong> {clickedPoint.Voltage}</div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const handleClick = (e) => {
    if (!e || !e.activeLabel) return;
    const found = data.find((d) => d.timestamp === e.activeLabel);
    if (!found) return;

    setClickedPoint({
      timestamp: found.timestamp,
      RPM: found.RPM,
      Voltage: found.values?.Bias_Voltage ?? "N/A",
    });
  };

  return (
    <div className="w-full h-[700px]  bg-card rounded p-12">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground dark:text-foreground">
        <ChartBarIcon className="w-6 h-6 text-primary" />
        Trend Comparison Chart
      </h2>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data}
          onClick={handleClick}
          margin={{ top: 10, right: 40, left: 0, bottom: 10 }}
        >
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="var(--color-foreground)"
            minTickGap={20}
          />
          <YAxis
            stroke="var(--color-foreground)"
            domain={["auto", "auto"]}
            allowDecimals={true}
            label={{
              value: `${metric.replace(/_/g, " ").toUpperCase()} (${unit})`,
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: "var(--color-foreground)",
              style: { fontWeight: "bold" },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => `${value} (${unit})`}
          />
          {channels.map((ch, idx) => (
            <Line
              key={`CH${ch}`}
              type="monotone"
              dataKey={`CH${ch}`}
              name={`CH${ch}: ${metric.replace(/_/g, " ").toUpperCase()}`}
              stroke={colors[idx % colors.length]}
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center space-x-3 py-6 mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
        <input
          id="toggle-spikes"
          type="checkbox"
          checked={showSpikes}
          onChange={() => setShowSpikes(!showSpikes)}
          className="w-4 h-4 accent-red-600"
        />
        <label htmlFor="toggle-spikes" className="select-none">
          Spikes shown in <span className="text-red-600 font-bold">RED dots</span>.
        </label>
      </div>

      {clickedPoint && (
        <div className="mt-4 p-3 bg-muted rounded text-sm text-foreground dark:text-foreground max-w-md">
          <strong>Selected Data Point:</strong><br />
          Timestamp: {new Date(clickedPoint.timestamp).toLocaleString()}<br />
          RPM: {clickedPoint.RPM}<br />
          Voltage: {clickedPoint.Voltage}
          <button
            className="ml-3 px-2 py-1 text-xs border rounded bg-secondary text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary transition"
            onClick={() => setClickedPoint(null)}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
