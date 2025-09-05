"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import react-leaflet components (client-side only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-markercluster"),
  { ssr: false }
);

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Sites Data
const sites = [
  {
    id: 1,
    name: "KRS OIL Filling Plant",
    coordinates: [22.784715, 72.405035],
    units: [
      {
        id: "unit1",
        name: "Unit 1 (Real Data)",
        devices: [
          { id: "vm-1", dbId: "sentinel-vm", type: "VM" },
          { id: "cpm-1", dbId: "sentinel-cpm", type: "CPM" },
        ],
      },
      {
        id: "unit2",
        name: "Unit 2 ",
        devices: [
          { id: "vm-2", type: "VM", status: "Offline" },
          { id: "cpm-2", type: "CPM", status: "Offline" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "KRS OIL Filter Plant",
    coordinates: [23.378879, 72.19199],
    units: [
      {
        id: "unit3",
        name: "Unit 3",
        devices: [
          { id: "vm-3", type: "VM", status: "Offline" },
          { id: "cpm-3", type: "CPM", status: "Offline" },
        ],
      },
      {
        id: "unit2",
        name: "Unit 2",
        devices: [
          { id: "vm-4", type: "VM", status: "Offline" },
          { id: "cpm-4", type: "CPM", status: "Offline" },
        ],
      },
      {
        id: "unit3",
        name: "Unit 3",
        devices: [
          { id: "vm-5", type: "VM", status: "Offline" },
          { id: "cpm-5", type: "CPM", status: "Offline" },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "KRS OIL Distribute",
    coordinates: [23.00501, 72.996703],
    units: [
      {
        id: "unit 4",
        name: "Unit 4",
        devices: [
          { id: "vm-6", type: "VM", status: "Offline" },
          { id: "cpm-6", type: "CPM", status: "Offline" },
        ],
      },
    ],
  },
];

export default function Dashboard() {
  const [selectedSite, setSelectedSite] = useState(null);
  const [deviceStatuses, setDeviceStatuses] = useState({}); // dbId -> "online"/"offline"

  // fetch device statuses from API
  useEffect(() => {
    async function fetchStatuses() {
      try {
        const res = await fetch("/api/devices/status");
        const data = await res.json();
        if (data.success) {
          const statusMap = {};
          data.devices.forEach((dev) => {
            statusMap[dev.deviceId] = dev.status; // e.g., "online"
          });
          setDeviceStatuses(statusMap);
        }
      } catch (err) {
        console.error("Failed to fetch statuses", err);
      }
    }

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Calculate totals
  const totalSites = sites.length;
  const totalUnits = sites.reduce((acc, site) => acc + site.units.length, 0);
  const totalDevices = sites.reduce(
    (acc, site) =>
      acc + site.units.reduce((uAcc, u) => uAcc + u.devices.length, 0),
    0
  );
  const activeAlarms = 3;

  return (
    <div className="p-4 space-y-4 min-h-screen w-full">
      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sites</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalSites}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Units</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalUnits}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Devices</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalDevices}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Alarms</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-500">
            {activeAlarms}
          </CardContent>
        </Card>
      </div>

      {/* Table + Map Section */}
      <div className="grid grid-cols-5 gap-4">
        {/* Table Section */}
        <div className="col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Units Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site) =>
                    site.units.map((unit) =>
                      unit.devices.map((device) => {
                        // Use live status when dbId is present; else fall back to mock status
                        const isOnline =
                          device.dbId
                            ? deviceStatuses[device.dbId] === "online"
                            : device.status === "Active";

                        return (
                          <TableRow key={device.id}>
                            <TableCell>{site.name}</TableCell>
                            <TableCell>{unit.name}</TableCell>
                            <TableCell>{device.type}</TableCell>
                            <TableCell>
                              {isOnline ? (
                                <span className="text-green-500">Active</span>
                              ) : (
                                <span className="text-red-500">Offline</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {unit.id === "unit1" ? (
                                <Link href="/units/unit1">
                                  <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    View
                                  </button>
                                </Link>
                              ) : (
                                <button
                                  className="px-3 py-1 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                                  disabled
                                >
                                  N/A
                                </button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <div className="col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>GIS Map</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <MapContainer
                center={[23.2, 72.5]}
                zoom={8}
                style={{ height: "100%", width: "100%", borderRadius: "12px" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Clustering */}
                <MarkerClusterGroup>
                  {sites.map((site) => (
                    <Marker
                      key={site.id}
                      position={site.coordinates}
                      eventHandlers={{
                        click: () => setSelectedSite(site),
                      }}
                    >
                      <Popup>
                        <strong>{site.name}</strong>
                        <br />
                        Units: {site.units.length}
                        <br />
                        Devices:{" "}
                        {site.units.reduce(
                          (acc, unit) => acc + unit.devices.length,
                          0
                        )}
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            </CardContent>

            {/* Site Details */}
            {selectedSite && (
              <div className="border-t p-3">
                <p className="text-lg font-semibold">{selectedSite.name}</p>
                <p>Units: {selectedSite.units.length}</p>
                <p>
                  Devices:{" "}
                  {selectedSite.units.reduce(
                    (acc, unit) => acc + unit.devices.length,
                    0
                  )}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
