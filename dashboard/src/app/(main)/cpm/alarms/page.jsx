"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadIcon, RefreshCwIcon } from "lucide-react";
import DataTable from "@/components/ui/data-table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BackToCPMButton from "@/components/cpm/BackToCPMButton";  // ✅ NEW


export default function CPMAlarmsPage() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [limit, setLimit] = useState(20);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAlarms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("start", startDate.toISOString());
      if (endDate) params.append("end", endDate.toISOString());
      if (!showAll) params.append("limit", limit);
      if (statusFilter !== "all")
        params.append("resolved", statusFilter === "resolved");

      const res = await axios.get(`/api/cpm/alarms?${params.toString()}`);
      let data = res.data;

      // ✅ Text search filter (client-side)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        data = data.filter(
          (alarm) =>
            alarm.message?.toLowerCase().includes(query) ||
            alarm.parameter?.toLowerCase().includes(query) ||
            alarm.level?.toLowerCase().includes(query)
        );
      }

      setAlarms(data);
    } catch (err) {
      console.error("Error fetching CPM alarms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
    const interval = setInterval(fetchAlarms, 15000);
    return () => clearInterval(interval);
  }, [limit, showAll, searchQuery, statusFilter]);

  // ✅ CSV Export Updated (Removed Unit, Stage, Cylinder)
  const exportCSV = () => {
    const headers = [
      "Timestamp",
      "Parameter",
      "Level",
      "Value",
      "Threshold",
      "Message",
      "Status",
      "Resolved At",
    ];
    const rows = alarms.map((a) => [
      new Date(a.timestamp).toLocaleString(),
      a.parameter?.split(".").pop() || "-", // ✅ Only last part
      a.level || "-",
      a.value,
      a.threshold,
      a.message,
      a.resolved ? "Resolved" : "Active",
      a.resolvedAt ? new Date(a.resolvedAt).toLocaleString() : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cpm_alarms_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Updated Table Columns
  const columns = [
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: ({ row }) =>
        new Date(row.original.timestamp).toLocaleString("en-IN"),
    },
    {
      accessorKey: "parameter",
      header: "Parameter",
      cell: ({ row }) => row.original.parameter?.split(".").pop() || "-", // ✅ Only last part
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => row.original.message || "-",
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => {
        const level = row.original.level || "unknown";
        const badgeColor =
          level?.toLowerCase() === "alarm"
            ? "destructive"
            : level?.toLowerCase() === "warning"
            ? "warning"
            : "secondary";

        return <Badge variant={badgeColor}>{level.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: "value",
      header: "Value",
    },
    {
      accessorKey: "threshold",
      header: "Threshold",
    },
    {
      accessorKey: "resolved",
      header: "Status",
      cell: ({ row }) => {
        const isResolved = row.original.resolved;
        const badgeColor = isResolved ? "success" : "destructive";
        const label = isResolved ? "Resolved" : "Active";
        return <Badge variant={badgeColor}>{label}</Badge>;
      },
    },
    {
      accessorKey: "resolvedAt",
      header: "Resolved At",
      cell: ({ row }) => {
        const resolvedAt = row.original.resolvedAt;
        return resolvedAt
          ? new Date(resolvedAt).toLocaleString("en-IN")
          : "-";
      },
    },
  ];

  return (
    <div className="p-4 space-y-4 min-h-screen w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Sentinel-CPM Alarms</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAlarms}>
            <RefreshCwIcon className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={exportCSV}>
            <DownloadIcon className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ✅ Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Date Pickers */}
        <div>
          <label className="block text-sm">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Select start"
            className="border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Select end"
            className="border rounded px-2 py-1"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Search Bar */}
        <div>
          <label className="block text-sm">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by text"
            className="border rounded px-2 py-1"
          />
        </div>

        {/* Show All Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
          <label className="text-sm">Show All Alarms</label>
        </div>

        <Button onClick={fetchAlarms}>Search</Button>
        {/* ✅ Back Button */}
        <BackToCPMButton />
        
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={alarms} isLoading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
