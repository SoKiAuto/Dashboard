"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Radar } from "lucide-react"; 

import VMChannelTileBias from "@/components/VMChannelTileBias";
import VMChannelTileRodDrop from "@/components/VMChannelTileRodDrop";
import VMRPMTile from "@/components/VMRPMTile";

export default function SentinelVMPage() {
  const [group1to8, setGroup1to8] = useState([]);
  const [group9to12, setGroup9to12] = useState([]);
  const [rpmDoc, setRPMDoc] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/vm/live");
      const json = await res.json();

      const rpm = json.find((d) => d.channel === "RPM");
      const channels = json.filter((d) => typeof d.channel === "number");

      setGroup1to8(channels.filter((d) => d.channel >= 1 && d.channel <= 8));
      setGroup9to12(channels.filter((d) => d.channel >= 9 && d.channel <= 12));
      setRPMDoc(rpm || null);
    } catch (err) {
      console.error("Error fetching VM data:", err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-4 space-y-8 min-h-screen w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
       <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Sentinel-VM Dashboard</h1>
                      
              <Link href="/vm/radar" title="Go to Radar View">
                <Radar
                  className="w-8 h-8 text-amber-500 hover:text-amber-600 transition-transform hover:scale-105 cursor-pointer"
                />
              </Link>

        </div>
       <div className="flex gap-2 flex-wrap">
          <Link href="/vm/diagnostic">
            <Button variant="secondary">Diagnostic</Button>
          </Link>
          <Link href="/vm/alarms">
            <Button variant="secondary">🔔 View Alarms</Button>
          </Link>
          <Link href="/vm/setpoints">
            <Button variant="outline">⚙️ Setpoints</Button>
          </Link>
          <Link href="/vm/trends">
            <Button variant="outline">📈 Trends</Button>
          </Link>
        </div>
      </div>

      {/* RPM Tile */}
      {rpmDoc && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Machine RPM</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <VMRPMTile key="rpm" data={rpmDoc} />
          </div>
        </section>
      )}

      {/* Channels 1–8 */}
      <section>
        <h2 className="text-lg font-semibold mt-6 mb-2">Channels 1–8 (Bias Voltage)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {group1to8.map((sensor) => (
            <VMChannelTileBias key={sensor.channel} data={sensor} />
          ))}
        </div>
      </section>

      {/* Channels 9–12 */}
      <section>
        <h2 className="text-lg font-semibold mt-6 mb-2">Channels 9–12 (Rod Drop)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {group9to12.map((sensor) => (
            <VMChannelTileRodDrop key={sensor.channel} data={sensor} />
          ))}
        </div>
      </section>
    </main>
  );
}
