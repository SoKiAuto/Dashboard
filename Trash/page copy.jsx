"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import TabsNav from "@/components/cpm/TabsNav";
import FiltersPanel from "@/components/cpm/FiltersPanel";
import TrendChart from "@/components/cpm/TrendChart";

// helper to build ISO strings for "last X" quick ranges
function isoRangeLast(hours = 1) {
  const to = new Date();
  const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
  // return local-ish datetime strings (ISO)
  return { start: from.toISOString(), end: to.toISOString() };
}

export default function CPMTrendsPage() {
  const [mode, setMode] = useState("cylinder"); // default tab
  const [payload, setPayload] = useState(null);
  const [data, setData] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const applyFilters = (p) => setPayload(p);

  const fetchTrends = useCallback(async (body) => {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/cpm/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: body.mode,
          start: body.start ? new Date(body.start).toISOString() : null,
          end: body.end ? new Date(body.end).toISOString() : null,
          interval: body.interval,
          metrics: body.metrics,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json || []);
    } catch (e) {
      console.error("Trends fetch failed:", e);
      setErr(e.message || "Failed to load trends");
      setData([]);
    } finally {
      setBusy(false);
    }
  }, []);

  // -------------- Default payload on first mount --------------
  useEffect(() => {
    // default: cylinder mode, C1 head-end suction & discharge, last 1 hour, 5m interval
    const { start, end } = isoRangeLast(1);
    const defaultMetrics = [
      { label: "C1 - Suction Pressure", path: "cylinder_1.head_end.Suction_Pressure_psi" },
      { label: "C1 - Discharge Pressure", path: "cylinder_1.head_end.Discharge_Pressure_psi" },
    ];

    const defaultPayload = {
      mode: "cylinder",
      start,
      end,
      interval: "5m",
      metrics: defaultMetrics,
    };

    setMode("cylinder");
    setPayload(defaultPayload);
    // fetch will be triggered by payload effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch trends when payload changes
  useEffect(() => {
    if (payload) fetchTrends(payload);
  }, [payload, fetchTrends]);

  // Auto-refresh every 30 sec
  useEffect(() => {
    if (!autoRefresh || !payload) return;
    const timer = setInterval(() => fetchTrends(payload), 30000);
    return () => clearInterval(timer);
  }, [autoRefresh, payload, fetchTrends]);

  const title = useMemo(() => {
    if (!payload) return "CPM Trends";
    return `CPM Trends • ${payload.mode?.toUpperCase()}`;
  }, [payload]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="text-sm">Auto-refresh</span>
          </label>
          <div className="text-sm">
            {busy ? (
              <span className="text-muted-foreground">Loading…</span>
            ) : err ? (
              <span className="text-destructive">{err}</span>
            ) : null}
          </div>
        </div>
      </div>

      <TabsNav active={mode} onChange={setMode} />

      {/* FiltersPanel now accepts a defaultPayload prop and emits onApply */}
      <FiltersPanel mode={mode} onApply={applyFilters} defaultPayload={payload} />

      <TrendChart data={data} />
    </div>
  );
}
