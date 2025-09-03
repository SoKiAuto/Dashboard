// dashboard/src/app/(main)/vm/[channel]/layout.js
"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LiveContext } from "@/context/liveContext";
import { Badge } from "@/components/ui/badge";
import BackToCPMButton from "@/components/cpm/BackToCPMButton";  // ✅ NEW


export default function ChannelLayout({ children }) {
  const { channel } = useParams();
  const [liveData, setLiveData] = useState(null);
  const [setpoints, setSetpoints] = useState(null);

  const fetchLive = async () => {
    const res = await fetch("/api/vm/live");
    const json = await res.json();
    const chData = json.find(d => String(d.channel) === channel);
    setLiveData(chData);
  };

  const fetchSetpoints = async () => {
    const res = await fetch(`/api/vm/setpoints?channel=${channel}`);
    setSetpoints(await res.json());
  };

  useEffect(() => {
    fetchLive();
    fetchSetpoints();
    const interval = setInterval(fetchLive, 3000);
    return () => clearInterval(interval);
  }, [channel]);

  const timestamp = liveData?.timestamp ? new Date(liveData.timestamp).toLocaleTimeString() : "N/A";
  const rms = liveData?.values?.Overall_RMS;
  const channelNum = isNaN(Number(channel)) ? null : Number(channel);
  const hasBias = channelNum >= 1 && channelNum <= 8;

  const rmsStatus = setpoints?.Overall_RMS
    ? rms > setpoints.Overall_RMS.alarm
      ? "bg-red-600"
      : rms > setpoints.Overall_RMS.warning
      ? "bg-yellow-500"
      : "bg-green-600"
    : "bg-gray-400";

  return (
    <LiveContext.Provider value={{ liveData, setpoints }}>
      
      <div className="px-8 py-6 space-y-6 w-full">
        
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">Channel {channel}</h1>
            <p className="text-sm text-muted-foreground">Sentinel‑VM</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">RPM: {liveData?.values?.RPM ?? "N/A"}</Badge>
            {hasBias && (
              <Badge className={`${rmsStatus} text-white`}>
                Overall RMS: {rms?.toFixed(2) ?? "N/A"}
              </Badge>
            )}
            <Badge variant="secondary">Updated {timestamp}</Badge>
          </div>
        </div>

        <div className="w-full">{children}</div>
      </div>
    </LiveContext.Provider>
  );
}
