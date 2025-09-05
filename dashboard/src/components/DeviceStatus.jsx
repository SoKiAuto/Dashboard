"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

export default function DeviceStatus() {
  const [vmStatus, setVmStatus] = useState("Offline");
  const [cpmStatus, setCpmStatus] = useState("Offline");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const vmRes = await fetch("/api/vm/live");
        if (vmRes.ok) {
          const vmData = await vmRes.json();
          setVmStatus(vmData && Array.isArray(vmData) ? "Active" : "Offline");
        }

        const cpmRes = await fetch("/api/cpm/live");
        if (cpmRes.ok) {
          const cpmData = await cpmRes.json();
          setCpmStatus(cpmData && cpmData.values ? "Active" : "Offline");
        }
      } catch {
        setVmStatus("Offline");
        setCpmStatus("Offline");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-3 flex gap-6 justify-center">
      <div className="flex items-center gap-2">
        <span className="font-semibold">CPM:</span>
        <span className={cpmStatus === "Active" ? "text-green-500" : "text-red-500"}>
          {cpmStatus}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">VM:</span>
        <span className={vmStatus === "Active" ? "text-green-500" : "text-red-500"}>
          {vmStatus}
        </span>
      </div>
    </Card>
  );
}
