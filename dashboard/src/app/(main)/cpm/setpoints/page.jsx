"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

export default function CPMSetpointsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCylinder, setSelectedCylinder] = useState("cylinder_1");
  const [selectedStage, setSelectedStage] = useState("stage_1");

  const fetchSetpoints = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cpm/setpoints");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load setpoints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetpoints();
  }, []);

  const handleChange = (section, keyPath, field, value) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      let ref = updated[section];
      for (const key of keyPath) {
        if (!ref[key]) {
          ref[key] = {};
        }
        ref = ref[key];
      }
      ref[field] = Number(value);
      return updated;
    });
  };

  const handleSave = async (section, keyPath) => {
    // Show a pending toast notification
    const savePromise = new Promise(async (resolve, reject) => {
      try {
        let updateData = data[section];
        for (const key of keyPath) {
          if (!updateData) break;
          updateData = updateData[key];
        }

        if (!updateData) {
          reject(new Error("Data to update not found."));
          return;
        }

        const res = await fetch("/api/cpm/setpoints", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section,
            keyPath,
            updateData: updateData,
          }),
        });

        if (!res.ok) {
          reject(new Error("Failed to update on the server."));
        }

        await fetchSetpoints();
        resolve("Setpoint updated successfully!");

      } catch (err) {
        console.error("Save error:", err);
        reject(err);
      }
    });

    toast.promise(savePromise, {
      loading: 'Saving setpoint...',
      success: (message) => message,
      error: 'Failed to save setpoint.',
    });
  };

  if (loading || !data) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 space-y-6 min-h-screen w-full">
      <h1 className="text-2xl font-bold">CPM Setpoint Configuration</h1>
      <Tabs defaultValue="unit">
        <TabsList>
          <TabsTrigger value="unit">Unit</TabsTrigger>
          <TabsTrigger value="cylinders">Cylinders</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
        </TabsList>
        <TabsContent value="unit">
          <div className="overflow-auto">
            <table className="min-w-[600px] w-full text-sm border rounded">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2">Parameter</th>
                  <th className="p-2">Warning</th>
                  <th className="p-2">Alarm</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.unit).map(([param, values]) => (
                  <tr key={param} className="border-t">
                    <td className="p-2 font-medium">{param}</td>
                    {["warning", "alarm"].map((f) => (
                      <td key={f} className="p-1">
                        <Input
                          type="number"
                          value={values[f] ?? ""}
                          onChange={(e) => handleChange("unit", [param], f, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="p-2">
                      <Button onClick={() => handleSave("unit", [param])} size="sm">
                        Save
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="cylinders">
          <div className="mb-4">
            <Select value={selectedCylinder} onValueChange={setSelectedCylinder}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Cylinder" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(data.cylinders).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {data.cylinders[selectedCylinder] && (
            <div className="overflow-auto">
              <table className="min-w-[800px] w-full text-sm border rounded">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2">Parameter</th>
                    <th className="p-2">Warning</th>
                    <th className="p-2">Alarm</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.cylinders[selectedCylinder]).map(
                    ([param, values]) => {
                      if (param === "_id") return null;
                      if (typeof values.warning === "number") {
                        return (
                          <tr key={param} className="border-t">
                            <td className="p-2 font-medium">{param}</td>
                            {["warning", "alarm"].map((f) => (
                              <td key={f} className="p-1">
                                <Input
                                  type="number"
                                  value={values[f] ?? ""}
                                  onChange={(e) => handleChange("cylinders", [selectedCylinder, param], f, e.target.value)}
                                />
                              </td>
                            ))}
                            <td className="p-2">
                              <Button onClick={() => handleSave("cylinders", [selectedCylinder, param])} size="sm">
                                Save
                              </Button>
                            </td>
                          </tr>
                        );
                      } else {
                        return Object.entries(values).map(
                          ([subParam, subValues]) => (
                            <tr key={`${param}_${subParam}`} className="border-t">
                              <td className="p-2 font-medium">{param}.{subParam}</td>
                              {["warning", "alarm"].map((f) => (
                                <td key={f} className="p-1">
                                  <Input
                                    type="number"
                                    value={subValues[f] ?? ""}
                                    onChange={(e) => handleChange("cylinders", [selectedCylinder, param, subParam], f, e.target.value)}
                                  />
                                </td>
                              ))}
                              <td className="p-2">
                                <Button onClick={() => handleSave("cylinders", [selectedCylinder, param, subParam])} size="sm">
                                  Save
                                </Button>
                              </td>
                            </tr>
                          )
                        );
                      }
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
        <TabsContent value="stages">
          <div className="mb-4">
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Stage" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(data.stages).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {data.stages[selectedStage] && (
            <div className="overflow-auto">
              <table className="min-w-[600px] w-full text-sm border rounded">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2">Parameter</th>
                    <th className="p-2">Warning</th>
                    <th className="p-2">Alarm</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.stages[selectedStage]).map(
                    ([param, values]) => {
                      if (param === "_id") return null;
                      return (
                        <tr key={param} className="border-t">
                          <td className="p-2 font-medium">{param}</td>
                          {["warning", "alarm"].map((f) => (
                            <td key={f} className="p-1">
                              <Input
                                type="number"
                                value={values[f] ?? ""}
                                onChange={(e) => handleChange("stages", [selectedStage, param], f, e.target.value)}
                              />
                            </td>
                          ))}
                          <td className="p-2">
                            <Button onClick={() => handleSave("stages", [selectedStage, param])} size="sm">
                              Save
                            </Button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 