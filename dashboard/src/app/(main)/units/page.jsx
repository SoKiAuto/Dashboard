"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Activity,
  Database,
  MapPin,
  Signal,
  Search
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { motion } from "framer-motion";

// ---------------- Skeleton Loader ----------------
const SkeletonCard = () => (
  <div className="p-5 rounded-2xl bg-gray-200/40 dark:bg-gray-800/40 animate-pulse shadow-md h-56" />
);

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Fetch units data
  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await fetch("/api/units");
        const data = await res.json();
        setUnits(data);
      } catch (error) {
        console.error("Error fetching units:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUnits();
  }, []);

  // Generate random sparkline data
  const getSparklineData = () =>
    Array.from({ length: 10 }, (_, i) => ({
      time: i,
      value: Math.floor(Math.random() * 100)
    }));

  // Calculate stats
  const overallStats = useMemo(() => {
    if (units.length === 0) return { live: 0, mock: 0 };
    return {
      live: units.filter((u) => u.dataSource === "live").length,
      mock: units.filter((u) => u.dataSource !== "live").length
    };
  }, [units]);

  // Filter + Search
  const filteredUnits = useMemo(() => {
    return units
      .filter((unit) =>
        filter === "all" ? true : unit.dataSource === filter
      )
      .filter((unit) =>
        unit.name.toLowerCase().includes(search.toLowerCase())
      );
  }, [units, filter, search]);

  return (
    <div className="p-6 space-y-8 min-h-screen w-full">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-wide">
          Units Dashboard
        </h1>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-lg shadow bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
            Live: {overallStats.live}
          </div>
          <div className="px-4 py-2 rounded-lg shadow bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
            Mock: {overallStats.mock}
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-border bg-background text-foreground shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {["all", "live", "mock"].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 rounded-xl transition-all shadow-sm ${
                filter === f
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "All Units" : f === "live" ? "Live" : "Mock"}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-lg text-center py-10">
          No units found.
        </div>
      ) : (
        <>
          {/* Units Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map((unit) => (
              <motion.div
                key={unit._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="shadow-xl border rounded-2xl bg-card backdrop-blur-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <Activity className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                      {unit.name}
                    </CardTitle>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full shadow ${
                        unit.dataSource === "live"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                      }`}
                    >
                      {unit.dataSource === "live" ? "Live" : "Mock"}
                    </span>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {unit.location || "Unknown Location"}
                    </div>

                    {/* Data Health */}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                      <Database className="w-4 h-4 text-gray-400" />
                      Data Health:{" "}
                      <span
                        className={`ml-1 font-semibold ${
                          unit.dataSource === "live"
                            ? "text-green-600 dark:text-green-300"
                            : "text-yellow-600 dark:text-yellow-300"
                        }`}
                      >
                        {unit.dataSource === "live" ? "Good" : "Limited"}
                      </span>
                    </div>

                    {/* Signal Status */}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                      <Signal className="w-4 h-4 text-gray-400" />
                      Status:{" "}
                      <span className="ml-1 font-semibold text-blue-600 dark:text-blue-400">
                        Online
                      </span>
                    </div>

                    

                    {/* View Details */}
                    <div className="mt-5">
                      {unit.name === "Unit 1" ? (
                        <Link href="/units/unit1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-all">
                            View Details
                          </Button>
                        </Link>
                      ) : (
                        <Button className="w-full" disabled>
                          Not Available
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
