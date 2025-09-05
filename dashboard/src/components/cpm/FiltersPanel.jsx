"use client";
import { useEffect, useMemo, useState } from "react";
import { unitMetrics, cylinderMetrics, stageMetrics } from "@/config/cpmMetricsCatalog";

export default function FiltersPanel({ mode, onApply }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [interval, setInterval] = useState("5m");

  // For standard tabs
  const [cylSel, setCylSel] = useState(["1"]);
  const [stgSel, setStgSel] = useState(["1"]);
  const [metricSel, setMetricSel] = useState("");

  // Custom compares two arbitrary picks (left/right)
  const [customLeft, setCustomLeft] = useState({ type: "cylinder", idx: "1", metric: "" });
  const [customRight, setCustomRight] = useState({ type: "cylinder", idx: "2", metric: "" });

  useEffect(() => {
    // sensible defaults per mode
    if (mode === "unit") setMetricSel(unitMetrics[0].path);
    if (mode === "stage") setMetricSel(stageMetrics[0].path.replace("{i}", "1"));
    if (mode === "cylinder") setMetricSel(cylinderMetrics[0].path.replace("{i}", "1"));
    if (mode === "custom") {
      setCustomLeft((p) => ({ ...p, metric: cylinderMetrics[3].path.replace("{i}", "1") })); // Head HP
      setCustomRight((p) => ({ ...p, metric: cylinderMetrics[4].path.replace("{i}", "1") })); // Crank HP
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const setQuick = (d = 0, h = 0) => {
    const to = new Date();
    const from = new Date(to);
    from.setHours(to.getHours() - h);
    from.setDate(from.getDate() - d);
    setStart(from.toISOString().slice(0, 16));
    setEnd(to.toISOString().slice(0, 16));
  };

  const metricsOptions = useMemo(() => {
    if (mode === "unit") return unitMetrics;
    if (mode === "stage") return stageMetrics.map((m) => ({ ...m, path: m.path.replace("{i}", stgSel[0] || "1") }));
    if (mode === "cylinder") return cylinderMetrics.map((m) => ({ ...m, path: m.path.replace("{i}", cylSel[0] || "1") }));
    return [];
  }, [mode, cylSel, stgSel]);

  const applyStandard = () => {
    // Build series list from multi-selects
    const series = [];
    if (mode === "unit") {
      series.push({ label: labelFromPath(metricSel), path: metricSel });
    } else if (mode === "stage") {
      stgSel.forEach((idx) =>
        series.push({
          label: `Stage ${idx} - ${labelFromPath(metricSel)}`,
          path: metricSel.replace(/stage_\d+/, `stage_${idx}`),
        })
      );
    } else if (mode === "cylinder") {
      cylSel.forEach((idx) =>
        series.push({
          label: `C${idx} - ${labelFromPath(metricSel)}`,
          path: metricSel.replace(/cylinder_\d+/, `cylinder_${idx}`),
        })
      );
    }

    onApply({
      mode,
      start,
      end,
      interval,
      metrics: series,
    });
  };

  const applyCustom = () => {
    const buildPath = (pick) => {
      const p = pick.metric;
      if (pick.type === "unit") return p;
      if (pick.type === "stage") return p.replace("{i}", pick.idx);
      if (pick.type === "cylinder") return p.replace("{i}", pick.idx);
      return p;
    };
    const series = [
      { label: `Left • ${prettyPick(customLeft)}`, path: buildPath(customLeft) },
      { label: `Right • ${prettyPick(customRight)}`, path: buildPath(customRight) },
    ];
    onApply({ mode, start, end, interval, metrics: series });
  };

  const prettyPick = (pick) => {
    const base =
      pick.type === "unit"
        ? "Unit"
        : pick.type === "stage"
        ? `Stage ${pick.idx}`
        : `C${pick.idx}`;
    return `${base} • ${labelFromPath(pick.metric)}`;
  };

  const labelFromPath = (path) => {
    // strip hierarchy and prettify last key(s)
    const last = path.split(".").slice(-1)[0];
    return last.replace(/_/g, " ");
  };

  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow p-4 space-y-4">
      {/* Date / Interval */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">Range</span>
        <input type="datetime-local" className="border rounded px-3 py-2" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="datetime-local" className="border rounded px-3 py-2" value={end} onChange={(e) => setEnd(e.target.value)} />
        <div className="flex gap-2">
          <button className="px-2 py-1 border rounded hover:opacity-80" onClick={() => setQuick(0, 1)}>Last 1h</button>
          <button className="px-2 py-1 border rounded hover:opacity-80" onClick={() => setQuick(0, 6)}>6h</button>
          <button className="px-2 py-1 border rounded hover:opacity-80" onClick={() => setQuick(1, 0)}>24h</button>
          <button className="px-2 py-1 border rounded hover:opacity-80" onClick={() => setQuick(7, 0)}>7d</button>
        </div>

        <span className="ml-4 text-sm font-semibold">Interval</span>
        <select className="border border-border rounded px-4 py-1 
                    bg-[var(--background)] text-[var(--foreground)] 
                    focus:ring-2 focus:ring-[var(--ring)]" value={interval} onChange={(e) => setInterval(e.target.value)}>
          <option value="1m">1 min</option>
          <option value="5m">5 min</option>
          <option value="15m">15 min</option>
          <option value="1h">Hourly</option>
          <option value="1d">Daily</option>
        </select>
      </div>

      {/* Mode-specific selectors */}
      {mode !== "custom" ? (
        <div className="flex flex-wrap items-center gap-4">
          {mode === "cylinder" && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">Cylinders</span>
              {[1,2,3,4,5,6].map((i) => {
                const v = String(i);
                const checked = cylSel.includes(v);
                return (
                  <label key={v} className="text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={checked}
                      onChange={() =>
                        setCylSel((prev) => (checked ? prev.filter((x) => x !== v) : [...prev, v]))
                      }
                    />
                    C{v}
                  </label>
                );
              })}
            </div>
          )}
          {mode === "stage" && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">Stages</span>
              {[1,2,3,4,5,6].map((i) => {
                const v = String(i);
                const checked = stgSel.includes(v);
                return (
                  <label key={v} className="text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={checked}
                      onChange={() =>
                        setStgSel((prev) => (checked ? prev.filter((x) => x !== v) : [...prev, v]))
                      }
                    />
                    S{v}
                  </label>
                );
              })}
            </div>
          )}

          <div>
            <span className="text-sm font-semibold mr-2">Metric</span>
            <select className="border border-border rounded px-4 py-1 
                    bg-[var(--background)] text-[var(--foreground)] 
                    focus:ring-2 focus:ring-[var(--ring)]" value={metricSel} onChange={(e) => setMetricSel(e.target.value)}>
              {metricsOptions.map((m) => (
                <option key={m.path} value={m.path}>{m.label}</option>
              ))}
            </select>
          </div>

          <button onClick={applyStandard} className="ml-auto px-4 py-2 rounded-2xl bg-primary text-primary-foreground hover:opacity-90">
            Apply
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Left pick */}
          <PickCard title="Left" pick={customLeft} setPick={setCustomLeft} />
          {/* Right pick */}
          <PickCard title="Right" pick={customRight} setPick={setCustomRight} />
          <div className="sm:col-span-2">
            <button onClick={applyCustom} className="px-4 py-2 rounded-2xl bg-primary text-primary-foreground hover:opacity-90">
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PickCard({ title, pick, setPick }) {
  return (
    <div className="bg-background border rounded-2xl p-3">
      <div className="mb-2 text-sm font-semibold">{title} series</div>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="border border-border rounded px-4 py-1 
                    bg-[var(--background)] text-[var(--foreground)] 
                    focus:ring-2 focus:ring-[var(--ring)]"
          value={pick.type}
          onChange={(e) => setPick((p) => ({ ...p, type: e.target.value }))}
        >
          <option value="unit">Unit</option>
          <option value="stage">Stage</option>
          <option value="cylinder">Cylinder</option>
        </select>

        {(pick.type === "stage" || pick.type === "cylinder") && (
          <select
            className="border border-border rounded px-4 py-1 
                    bg-[var(--background)] text-[var(--foreground)] 
                    focus:ring-2 focus:ring-[var(--ring)]"
            value={pick.idx}
            onChange={(e) => setPick((p) => ({ ...p, idx: e.target.value }))}
          >
            {["1","2","3","4","5","6"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}

        <select
          className="border border-border rounded px-4 py-1 
                    bg-[var(--background)] text-[var(--foreground)] 
                    focus:ring-2 focus:ring-[var(--ring)]"
          value={pick.metric}
          onChange={(e) => setPick((p) => ({ ...p, metric: e.target.value }))}
        >
          {(pick.type === "unit" ? unitMetrics
            : pick.type === "stage" ? stageMetrics
            : cylinderMetrics
          ).map((m) => (
            <option key={m.path} value={m.path}>{m.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
