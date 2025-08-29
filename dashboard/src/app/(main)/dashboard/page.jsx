"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Wifi, AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/modeToggle";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeviceStatus = async () => {
    try {
      const res = await fetch("/api/devices/status", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Unexpected API Response:", text);
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setDevices(data.devices);
      } else {
        console.error("API Error:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch device status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceStatus();
    const interval = setInterval(fetchDeviceStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex flex-col min-h-screen w-full p-6 bg-background text-foreground">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Device Dashboard</h1>
        <div className="flex gap-3 items-center">
          <ModeToggle />
          <Button
            onClick={fetchDeviceStatus}
            variant="default"
            className="flex items-center gap-2 rounded-full px-5"
          >
            <RefreshCcw className="h-5 w-5" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Device Status Cards */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-muted animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device, index) => (
            <motion.div
              key={device.deviceId}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {device.deviceName}
                  </CardTitle>
                  {device.status === "online" ? (
                    <Wifi className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  )}
                </CardHeader>

                <CardContent>
                  <p
                    className={`text-lg font-semibold ${
                      device.status === "online"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {device.status === "online" ? "🟢 Online" : "🔴 Offline"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last Updated:{" "}
                    <span className="font-medium">
                      {new Date(device.lastUpdated).toLocaleTimeString()}
                    </span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
