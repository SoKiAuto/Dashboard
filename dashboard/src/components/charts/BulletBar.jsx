"use client";

import React, { useMemo } from "react";

/**
 * Advanced BulletBar component
 * Props:
 *  - label: string
 *  - value: number
 *  - max: number
 *  - thresholds: { warn:number, crit:number }
 *  - unit: string
 */
export default function BulletBar({
  label = "",
  value = 0,
  max = 20,
  thresholds = { warn: 10, crit: 20 },
  unit = "",
}) {
  const safeValue = Number(value) || 0;
  const pct = Math.min(100, Math.max(0, (safeValue / max) * 100));

  // choose color stops depending on severity
  const severity = useMemo(() => {
    if (safeValue >= thresholds.crit) return "critical";
    if (safeValue >= thresholds.warn) return "warn";
    if (safeValue > 0) return "ok";
    return "none";
  }, [safeValue, thresholds]);

  const color = {
    ok: "linear-gradient(90deg, rgba(34,197,94,1) 0%, rgba(132,204,22,1) 100%)",
    warn: "linear-gradient(90deg, rgba(245,158,11,1) 0%, rgba(250,204,21,1) 100%)",
    critical: "linear-gradient(90deg, rgba(239,68,68,1) 0%, rgba(220,38,38,1) 100%)",
    none: "linear-gradient(90deg, rgba(156,163,175,1) 0%, rgba(203,213,225,1) 100%)",
  }[severity];

  // Small circular percentage indicator (SVG)
  const circleRadius = 18;
  const circleCirc = 2 * Math.PI * circleRadius;
  const circleOffset = circleCirc * (1 - pct / 100);

  const statusLabel =
    severity === "critical" ? "CRITICAL" : severity === "warn" ? "WARN" : severity === "ok" ? "OK" : "N/A";

  return (
    <div
      className="w-full p-3 rounded-lg border bg-card/40 hover:shadow-md transition-shadow"
      title={`${label}: ${safeValue} ${unit} — ${statusLabel}`}
    >
      <div className="flex items-center gap-3">
        {/* mini circular indicator */}
        <div className="flex-none">
          <svg width="44" height="44" viewBox="0 0 44 44">
            <defs>
              <linearGradient id="g1" x1="0%" x2="100%">
                <stop offset="0%" stopColor={severity === "critical" ? "#ef4444" : severity === "warn" ? "#f59e0b" : "#22c55e"} />
                <stop offset="100%" stopColor={severity === "critical" ? "#dc2626" : severity === "warn" ? "#f59e0b" : "#84cc16"} />
              </linearGradient>
            </defs>

            <g transform="translate(22,22)">
              <circle r={circleRadius} cx="0" cy="0" strokeWidth="5" stroke="#e6e9ef" fill="transparent" />
              <circle
                r={circleRadius}
                cx="0"
                cy="0"
                strokeWidth="5"
                strokeLinecap="round"
                stroke="url(#g1)"
                fill="transparent"
                strokeDasharray={circleCirc}
                strokeDashoffset={circleOffset}
                transform="rotate(-90)"
                style={{ transition: "stroke-dashoffset 700ms ease" }}
              />
              <text x="0" y="4" fontSize="10" textAnchor="middle" fill="var(--color-foreground)">
                {Math.round(pct)}%
              </text>
            </g>
          </svg>
        </div>

        {/* label + bar */}
        <div className="flex-1">
          <div className="flex justify-between items-baseline">
            <div className="text-sm font-medium text-muted-foreground">{label}</div>
            <div className="text-sm font-semibold tabular-nums">{safeValue.toFixed(2)} {unit}</div>
          </div>

          <div className="mt-2">
            <div className="relative h-3 rounded-full bg-[--muted] overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
              <div
                className="absolute left-0 top-0 h-3 rounded-full"
                style={{
                  width: `${pct}%`,
                  background: color,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "width 700ms cubic-bezier(.2,.9,.2,1), background 300ms ease",
                }}
              />
            </div>

            {/* thresholds ticks */}
            <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
              <span>0</span>
              <span>{thresholds.warn}</span>
              <span>{thresholds.crit}</span>
              <span>{max}</span>
            </div>
          </div>
        </div>

        {/* status pill */}
        <div className="flex-none">
          <div
            className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
              severity === "critical" ? "bg-red-600 text-white" : severity === "warn" ? "bg-yellow-400 text-black" : severity === "ok" ? "bg-green-600 text-white" : "bg-gray-300 text-black"
            }`}
          >
            {statusLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
