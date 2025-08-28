"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, RefreshCcw, CalendarIcon } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export default function CylinderHistoryTable({ cylinder }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(null);
  const [range, setRange] = useState(null);
  const [sortField, setSortField] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Fetch history data
  const fetchHistory = async () => {
    try {
      setLoading(true);

      let query = "";

      if (date) {
        query = `&date=${format(date, "yyyy-MM-dd")}`;
      } else if (range) {
        query = `&start=${format(range.start, "yyyy-MM-dd")}&end=${format(
          range.end,
          "yyyy-MM-dd"
        )}`;
      }

      const res = await fetch(`/api/cpm/history?cylinder=${cylinder}${query}`);
      const json = await res.json();
      setHistory(json || []);
    } catch (err) {
      console.error("❌ History fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [cylinder, date, range]);

  const cylKey = cylinder.startsWith("cylinder_")
    ? cylinder
    : `cylinder_${cylinder}`;

  // ✅ Download CSV
  const downloadCSV = () => {
    const headers = [
      "Timestamp",
      "HE HP",
      "CE HP",
      "Discharge (psi)",
      "Suction (psi)",
      "Flow (MMSCFD)",
    ];

    const rows = history.map((h) => {
      const c = h.values?.cylinders?.[cylKey];
      return [
        new Date(h.timestamp).toLocaleString(),
        c?.head_end?.HP ?? "-",
        c?.crank_end?.HP ?? "-",
        c?.head_end?.Discharge_Pressure_psi ?? "-",
        c?.head_end?.Suction_Pressure_psi ?? "-",
        c?.head_end?.Cylinder_Flow_MMSCFD ?? "-",
      ];
    });

    const csvContent =
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${cylinder}_history.csv`);
    link.click();
  };

  // ✅ Quick Range Handlers
  const handleQuickRange = (days) => {
    if (days === 0) {
      // Today
      const today = new Date();
      setDate(today);
      setRange(null);
    } else if (days === 1) {
      // Yesterday
      const yesterday = subDays(new Date(), 1);
      setDate(yesterday);
      setRange(null);
    } else {
      // Last N days
      setDate(null);
      setRange({
        start: subDays(new Date(), days - 1),
        end: endOfDay(new Date()),
      });
    }
  };

  // ✅ Sorting logic
  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sorted = [...history].sort((a, b) => {
      const valA =
        field === "timestamp"
          ? new Date(a.timestamp)
          : a.values?.cylinders?.[cylKey]?.head_end?.[field] || 0;
      const valB =
        field === "timestamp"
          ? new Date(b.timestamp)
          : b.values?.cylinders?.[cylKey]?.head_end?.[field] || 0;
      return order === "asc" ? valA - valB : valB - valA;
    });

    setHistory(sorted);
  };

  // ✅ Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = history.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  // ✅ Status coloring
  const getStatusColor = (value, type) => {
    if (value == null || value === "-") return "text-muted-foreground";

    if (type === "hp") {
      if (value > 200) return "text-red-500 font-bold";
      if (value > 150) return "text-orange-500 font-semibold";
      return "text-green-500 font-medium";
    }

    if (type === "discharge") {
      if (value > 400) return "text-red-500 font-bold";
      if (value > 300) return "text-orange-500 font-semibold";
      return "text-green-500 font-medium";
    }

    if (type === "suction") {
      if (value < 50) return "text-red-500 font-bold";
      if (value < 80) return "text-orange-500 font-semibold";
      return "text-green-500 font-medium";
    }

    return "text-foreground";
  };

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border mt-8 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold">Cylinder Readings</h3>
        <div className="flex flex-wrap gap-3 items-center">
          {/* ✅ Quick Range Filters */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleQuickRange(0)}
              className={cn(date && format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && "bg-primary text-white")}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickRange(1)}
            >
              Yesterday
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickRange(7)}
            >
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickRange(30)}
            >
              Last 30 Days
            </Button>
          </div>

          {/* ✅ Shadcn Calendar */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date
                  ? format(date, "PPP")
                  : range
                  ? `${format(range.start, "MMM d")} - ${format(range.end, "MMM d")}`
                  : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(val) => {
                  setDate(val);
                  setRange(null);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Refresh Button */}
          <button
            onClick={fetchHistory}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90 transition"
          >
            <RefreshCcw size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          {/* CSV Export */}
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1 px-3 py-1.5 bg-chart-3 text-white rounded-lg shadow hover:opacity-90 transition"
          >
            <ArrowDownToLine size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[500px] rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-muted z-10 shadow-sm">
            <tr>
              <th
                className="p-2 text-left cursor-pointer"
                onClick={() => handleSort("timestamp")}
              >
                Timestamp {sortField === "timestamp" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="p-2 text-center cursor-pointer" onClick={() => handleSort("HP")}>
                HE HP
              </th>
              <th className="p-2 text-center cursor-pointer" onClick={() => handleSort("HP")}>
                CE HP
              </th>
              <th className="p-2 text-center cursor-pointer" onClick={() => handleSort("Discharge_Pressure_psi")}>
                Discharge (psi)
              </th>
              <th className="p-2 text-center cursor-pointer" onClick={() => handleSort("Suction_Pressure_psi")}>
                Suction (psi)
              </th>
              <th className="p-2 text-center">Flow (MMSCFD)</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHistory.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-muted-foreground">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedHistory.map((h) => {
                const c = h.values?.cylinders?.[cylKey];
                return (
                  <tr
                    key={h._id}
                    className="border-t border-border hover:bg-muted/30 transition"
                  >
                    <td className="p-2 text-xs">
                      <div>{new Date(h.timestamp).toLocaleTimeString()}</div>
                      <div className="text-muted-foreground text-[11px]">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className={`p-2 text-center ${getStatusColor(c?.head_end?.HP, "hp")}`}>
                      {c?.head_end?.HP ?? "-"}
                    </td>
                    <td className={`p-2 text-center ${getStatusColor(c?.crank_end?.HP, "hp")}`}>
                      {c?.crank_end?.HP ?? "-"}
                    </td>
                    <td className={`p-2 text-center ${getStatusColor(c?.head_end?.Discharge_Pressure_psi, "discharge")}`}>
                      {c?.head_end?.Discharge_Pressure_psi ?? "-"}
                    </td>
                    <td className={`p-2 text-center ${getStatusColor(c?.head_end?.Suction_Pressure_psi, "suction")}`}>
                      {c?.head_end?.Suction_Pressure_psi ?? "-"}
                    </td>
                    <td className="p-2 text-center">
                      {c?.head_end?.Cylinder_Flow_MMSCFD ?? "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
