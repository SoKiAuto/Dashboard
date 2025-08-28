"use client";
import { useEffect, useMemo, useState } from "react";
import cpmMetricsConfig from "@/config/cpmMetricsCatalog";

export default function TrendFilters({ onChange }) {
  const [level, setLevel] = useState("unit"); // unit | cylinder | stage
  const [metric, setMetric] = useState("Unit_RPM");
  const [cylinders, setCylinders] = useState(["1", "2", "3"]);
  const [stages, setStages] = useState(["1"]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const metricsForLevel = useMemo(() => cpmMetricsConfig[level] || [], [level]);

  useEffect(() => {
    // send initial state up on mount
    onChange({ level, metric, cylinders, stages, start, end });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (arr, setArr, val) => {
    setArr((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const setQuickRange = (days = 0, hours = 0) => {
    const to = new Date();
    const from = new Date(to);
    from.setHours(to.getHours() - hours);
    from.setDate(from.getDate() - days);
    setStart(from.toISOString().slice(0, 16));
    setEnd(to.toISOString().slice(0, 16));
  };

  const apply = () => {
    onChange({ level, metric, cylinders, stages, start, end });
  };

  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="text-sm font-semibold mr-2">Level</label>
          <select
            className="border rounded px-3 py-2"
            value={level}
            onChange={(e) => {
              const lv = e.target.value;
              setLevel(lv);
              // pick first metric of that group
              const first = (cpmMetricsConfig[lv] || [])[0];
              if (first) setMetric(first.value);
            }}
          >
            <option value="unit">Unit</option>
            <option value="cylinder">Cylinder</option>
            <option value="stage">Stage</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mr-2">Metric</label>
          <select
            className="border rounded px-3 py-2 min-w-56"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            {metricsForLevel.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {level === "cylinder" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">Cylinders</span>
            {[1, 2, 3, 4, 5, 6].map((c) => {
              const val = String(c);
              return (
                <label key={c} className="text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={cylinders.includes(val)}
                    onChange={() => toggle(cylinders, setCylinders, val)}
                  />
                  C{val}
                </label>
              );
            })}
          </div>
        )}

        {level === "stage" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">Stages</span>
            {[1, 2, 3, 4, 5, 6].map((s) => {
              const val = String(s);
              return (
                <label key={s} className="text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={stages.includes(val)}
                    onChange={() => toggle(stages, setStages, val)}
                  />
                  S{val}
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">Date range</span>
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setQuickRange(0, 1)}
            className="px-2 py-1 border rounded hover:opacity-80"
          >
            Last 1h
          </button>
          <button
            onClick={() => setQuickRange(1, 0)}
            className="px-2 py-1 border rounded hover:opacity-80"
          >
            24h
          </button>
          <button
            onClick={() => setQuickRange(7, 0)}
            className="px-2 py-1 border rounded hover:opacity-80"
          >
            1 Week
          </button>
          <button
            onClick={() => setQuickRange(30, 0)}
            className="px-2 py-1 border rounded hover:opacity-80"
          >
            1 Month
          </button>
        </div>

        <button
          onClick={apply}
          className="ml-auto px-4 py-2 rounded-2xl bg-primary text-primary-foreground hover:opacity-90"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
