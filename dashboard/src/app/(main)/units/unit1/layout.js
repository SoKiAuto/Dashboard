"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LiveContext } from "@/context/liveContext";
import { Badge } from "@/components/ui/badge";

export default function CylinderLayout({ children }) {
  const { cylinder } = useParams();
  const [liveData, setLiveData] = useState(null);

  const fetchLive = async () => {
    try {
      const res = await fetch(`/api/cpm/live`);
      const json = await res.json();
      setLiveData(json);
    } catch (err) {
      console.error("❌ Failed to fetch CPM live data:", err);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 3000);
    return () => clearInterval(interval);
  }, [cylinder]);

  const timestamp = liveData?.timestamp
    ? new Date(liveData.timestamp).toLocaleTimeString()
    : "N/A";

  return (
    <LiveContext.Provider value={{ liveData }}>
      <div className="px-8 py-6 space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">Unit {cylinder}</h1>
            <p className="text-sm text-muted-foreground">Unit Dashboard</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Updated {timestamp}
            </Badge>
          </div>
        </div>

        <div className="w-full">{children}</div>
      </div>
    </LiveContext.Provider>
  );
}
