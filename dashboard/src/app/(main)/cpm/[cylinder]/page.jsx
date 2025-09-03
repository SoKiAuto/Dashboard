"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CylinderMetrics from "@/components/cpm/CylinderMetrics";
import CylinderCharts from "@/components/cpm/CylinderCharts";
import CylinderHistoryTable from "@/components/cpm/CylinderHistoryTable";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BackToCPMButton from "@/components/cpm/BackToCPMButton";  // ✅ NEW

export default function CylinderPage() {
  const { cylinder } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/cpm/live", { cache: "no-store" });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      if (!data?.values?.cylinders?.[cylinder]) {
        throw new Error("Cylinder data not found");
      }
      setDoc(data);
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to fetch");
      setDoc(null);
    }
  };

  useEffect(() => {
    const startPolling = () => {
      clearInterval(intervalRef.current);
      fetchData();
      intervalRef.current = setInterval(fetchData, 3000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        startPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cylinder]);

  if (error) {
    return (
      <main className="p-6 w-full">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
          <div className="text-red-500 font-medium">❌ {error}</div>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!doc) {
    return (
      <main className="p-6 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Card className="p-4">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </Card>
        <Card className="p-4">
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </main>
    );
  }

  const cylData = doc?.values?.cylinders?.[cylinder] || {};

  return (
    <main className="p-6 space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold capitalize">
          {cylinder.replace("_", " ")}
        </h1>

        {/* ✅ Back Button */}
        <BackToCPMButton />
      </div>

      {/* Live update indicator */}
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Last updated: {new Date(doc.timestamp).toLocaleTimeString()}
      </span>

      {/* Cylinder Metrics */}
      <Card className="p-4">
        <CylinderMetrics data={cylData} />
      </Card>

      {/* Live Charts */}
      <CylinderCharts cylinder={cylinder} />

      {/* History Table */}
      <Card className="p-4">
        <CylinderHistoryTable cylinder={cylinder} />
      </Card>
    </main>
  );
}
