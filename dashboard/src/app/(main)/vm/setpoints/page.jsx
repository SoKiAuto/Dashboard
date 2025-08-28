"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VMSetpointsPage() {
  const [setpoints, setSetpoints] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSetpoints = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vm/setpoints");
      const json = await res.json();
      setSetpoints(json);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetpoints();
  }, []);

  const handleChange = (channel, section, key, value) => {
    setSetpoints((prev) =>
      prev.map((item) => {
        if (item.channel !== channel) return item;
        return {
          ...item,
          [section]: {
            ...item[section],
            [key]: Number(value),
          },
        };
      })
    );
  };

  const handleSave = async (channelData) => {
    try {
      const res = await fetch("/api/vm/setpoints", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(channelData),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Setpoints updated for Channel ${channelData.channel}`);
    } catch (err) {
      toast.error(`Update failed for Channel ${channelData.channel}`);
    }
  };

  return (
    <div className="p-4 space-y-6 min-h-screen w-full">
      <h1 className="text-2xl font-bold">Setpoint Configuration</h1>

      {loading && <p className="text-muted-foreground">Loading...</p>}

      <div className="overflow-auto">
        <table className="min-w-[1200px] w-full text-sm border rounded">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="p-2">Channel</th>
              <th colSpan={3}>Overall RMS</th>
              <th colSpan={2}>Waveform RMS</th>
              <th colSpan={2}>FFT RMS</th>
              <th colSpan={2}>Bias Voltage</th>
              <th className="p-2">Action</th>
            </tr>
            <tr className="bg-muted/40">
              <th></th>
              <th>Baseline</th>
              <th>Warning</th>
              <th>Alarm</th>
              <th>Warning</th>
              <th>Alarm</th>
              <th>Warning</th>
              <th>Alarm</th>
              <th>Min</th>
              <th>Max</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {setpoints.map((sp) => (
              <tr key={sp.channel} className="border-t">
                <td className="p-2 font-medium">{sp.channel}</td>

                {/* Overall RMS */}
                {["baseline", "warning", "alarm"].map((key) => (
                  <td key={key} className="p-1">
                    <Input
                      type="number"
                      value={sp.Overall_RMS?.[key] ?? ""}
                      onChange={(e) =>
                        handleChange(sp.channel, "Overall_RMS", key, e.target.value)
                      }
                    />
                  </td>
                ))}

                {/* Waveform RMS */}
                {["warning", "alarm"].map((key) => (
                  <td key={key} className="p-1">
                    <Input
                      type="number"
                      value={sp.Waveform_RMS?.[key] ?? ""}
                      onChange={(e) =>
                        handleChange(sp.channel, "Waveform_RMS", key, e.target.value)
                      }
                    />
                  </td>
                ))}

                {/* FFT RMS */}
                {["warning", "alarm"].map((key) => (
                  <td key={key} className="p-1">
                    <Input
                      type="number"
                      value={sp.FFT_RMS?.[key] ?? ""}
                      onChange={(e) =>
                        handleChange(sp.channel, "FFT_RMS", key, e.target.value)
                      }
                    />
                  </td>
                ))}

                {/* Bias Voltage */}
                {["min", "max"].map((key) => (
                  <td key={key} className="p-1">
                    <Input
                      type="number"
                      value={sp.Bias_Voltage?.[key] ?? ""}
                      onChange={(e) =>
                        handleChange(sp.channel, "Bias_Voltage", key, e.target.value)
                      }
                    />
                  </td>
                ))}

                <td className="p-2">
                  <Button onClick={() => handleSave(sp)} size="sm">
                    Save
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
