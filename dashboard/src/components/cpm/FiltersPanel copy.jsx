"use client";
import { useEffect, useMemo, useState } from "react";
import { unitMetrics, cylinderMetrics, stageMetrics } from "@/config/cpmMetricsCatalog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// If your project provides Select/Combobox components under these paths, these imports work.
// If your project uses different paths for shadcn components, adjust imports accordingly.
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";

export default function FiltersPanel({ mode, onApply, defaultPayload = null }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [interval, setIntervalValue] = useState("5m");

  // For standard tabs
  const [cylSel, setCylSel] = useState(["1"]);
  const [stgSel, setStgSel] = useState(["1"]);
  const [metricSel, setMetricSel] = useState("");

  // Multi-metrics support (array of metric objects)
  const [multiMetrics, setMultiMetrics] = useState([]);

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

  // Initialize from defaultPayload (first load). This allows page to show default chart.
  useEffect(() => {
    if (!defaultPayload) return;
    setIntervalValue(defaultPayload.interval || "5m");
    setStart(defaultPayload.start ? defaultPayload.start.slice(0, 16) : "");
    setEnd(defaultPayload.end ? defaultPayload.end.slice(0, 16) : "");
    if (Array.isArray(defaultPayload.metrics) && defaultPayload.metrics.length > 0) {
      setMultiMetrics(defaultPayload.metrics.map((m) => ({ label: m.label, path: m.path })));
      // select the first metric in the single-metric selector for continuity
      setMetricSel(defaultPayload.metrics[0].path);
    }
  }, [defaultPayload]);

  const setQuick = (hours = 1) => {
    const to = new Date();
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
    setStart(from.toISOString().slice(0, 16));
    setEnd(to.toISOString().slice(0, 16));
    setIntervalValue(hours <= 1 ? "5m" : hours <= 6 ? "15m" : "1h");
  };

  const resetToDefaults = () => {
    setQuick(1);
    setIntervalValue("5m");
    setCylSel(["1"]);
    setStgSel(["1"]);
    setMetricSel(cylinderMetrics[0].path.replace("{i}", "1"));
    setMultiMetrics([]);
    setCustomLeft({ type: "cylinder", idx: "1", metric: cylinderMetrics[0].path.replace("{i}", "1") });
    setCustomRight({ type: "cylinder", idx: "2", metric: cylinderMetrics[1].path.replace("{i}", "2") });
  };

  const metricsOptions = useMemo(() => {
    if (mode === "unit") return unitMetrics;
    if (mode === "stage") return stageMetrics.map((m) => ({ ...m, path: m.path.replace("{i}", stgSel[0] || "1") }));
    if (mode === "cylinder") return cylinderMetrics.map((m) => ({ ...m, path: m.path.replace("{i}", cylSel[0] || "1") }));
    return [];
  }, [mode, cylSel, stgSel]);

  const applyStandard = () => {
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
      // if multiMetrics set, use those; otherwise use metricSel across selected cylinders
      if (multiMetrics.length > 0) {
        multiMetrics.forEach((m) => series.push({ label: m.label, path: m.path }));
      } else {
        cylSel.forEach((idx) =>
          series.push({
            label: `C${idx} - ${labelFromPath(metricSel)}`,
            path: metricSel.replace(/cylinder_\d+/, `cylinder_${idx}`),
          })
        );
      }
    }

    onApply({
      mode,
      start,
      end,
      interval: interval || "5m",
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
    const base = pick.type === "unit" ? "Unit" : pick.type === "stage" ? `Stage ${pick.idx}` : `C${pick.idx}`;
    return `${base} • ${labelFromPath(pick.metric)}`;
  };

  const labelFromPath = (path) => {
    const last = path.split(".").slice(-1)[0];
    return last.replace(/_/g, " ");
  };

  // Multi-select helper (simple add / remove)
  const toggleMetricInMulti = (m) => {
    const exists = multiMetrics.find((x) => x.path === m.path);
    if (exists) setMultiMetrics((prev) => prev.filter((x) => x.path !== m.path));
    else setMultiMetrics((prev) => [...prev, { label: m.label, path: m.path }]);
  };

  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow p-4 space-y-4">
      {/* Date / Interval */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">Range</span>
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
          <button className="px-2 py-1 border rounded hover:opacity-80" onClick={() => setQuick(1)}>
            Last 1h
          </button>
          <button className="px-2 py-1 border rounded hover:opacity-80" onClick={() => setQuick(6)}>
            6h
          </button>
          <button className="px-2 py-1 border rounded hover:opacity-80" onClick={() => setQuick(24)}>
            24h
          </button>
          <button className="px-2 py-1 border rounded hover:opacity-80" onClick={() => setQuick(168)}>
            7d
          </button>
        </div>

        <span className="ml-4 text-sm font-semibold">Interval</span>

        <Select value={interval} onValueChange={(v) => setIntervalValue(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 min</SelectItem>
            <SelectItem value="5m">5 min</SelectItem>
            <SelectItem value="15m">15 min</SelectItem>
            <SelectItem value="1h">Hourly</SelectItem>
            <SelectItem value="1d">Daily</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset
          </Button>
          <Button onClick={applyStandard}>Apply</Button>
        </div>
      </div>

      {/* Mode-specific selectors */}
      {mode !== "custom" ? (
        <div className="flex flex-wrap items-center gap-4">
          {mode === "cylinder" && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">Cylinders</span>
              {[1, 2, 3, 4, 5, 6].map((i) => {
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
              {[1, 2, 3, 4, 5, 6].map((i) => {
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
            <Popover>
              <PopoverTrigger asChild>
                <button className="border px-3 py-2 rounded">{labelFromPath(metricSel) || "Choose metric"}</button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0">
                <Command>
                  <CommandInput placeholder="Search metrics..." />
                  <CommandList>
                    <CommandEmpty>No metrics</CommandEmpty>
                    {(metricsOptions || []).map((m) => (
                      <CommandItem
                        key={m.path}
                        onSelect={() => {
                          setMetricSel(m.path);
                        }}
                      >
                        {m.label}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Multi-metric quick selector (useful to compare multiple metrics) */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold mr-2">Multi</span>
            <Popover>
              <PopoverTrigger asChild>
                <button className="border px-3 py-2 rounded">Select metrics ({multiMetrics.length})</button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px]">
                <div className="space-y-2">
                  {(metricsOptions || []).map((m) => {
                    const selected = !!multiMetrics.find((x) => x.path === m.path);
                    return (
                      <label key={m.path} className="flex items-center gap-2">
                        <input type="checkbox" checked={selected} onChange={() => toggleMetricInMulti(m)} />
                        <span className={cn("text-sm", selected ? "font-medium" : "")}>{m.label}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button onClick={() => { /* close popover - popover closes automatically in many implementations */ }}>Done</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

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
          className="border rounded px-3 py-2"
          value={pick.type}
          onChange={(e) => setPick((p) => ({ ...p, type: e.target.value }))}
        >
          <option value="unit">Unit</option>
          <option value="stage">Stage</option>
          <option value="cylinder">Cylinder</option>
        </select>

        {(pick.type === "stage" || pick.type === "cylinder") && (
          <select
            className="border rounded px-3 py-2"
            value={pick.idx}
            onChange={(e) => setPick((p) => ({ ...p, idx: e.target.value }))}
          >
            {["1", "2", "3", "4", "5", "6"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}

        <select
          className="border rounded px-3 py-2 min-w-56"
          value={pick.metric}
          onChange={(e) => setPick((p) => ({ ...p, metric: e.target.value }))}
        >
          {(pick.type === "unit" ? unitMetrics : pick.type === "stage" ? stageMetrics : cylinderMetrics).map((m) => (
            <option key={m.path} value={m.path}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
