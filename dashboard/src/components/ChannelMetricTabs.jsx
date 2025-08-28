"use client";
import { metricInfo } from "@/lib/metricInfo";

export default function ChannelMetricTabs({ selectedMetric, onSelectMetric }) {
  const tabs = Object.keys(metricInfo);

  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-2">
      {tabs.map((key) => {
        const info = metricInfo[key];
        const isSelected = selectedMetric === key;

        return (
          <button
            key={key}
            onClick={() => onSelectMetric(key)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              isSelected
                ? "bg-primary text-white shadow"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {info.label}
          </button>
        );
      })}
    </div>
  );
}
