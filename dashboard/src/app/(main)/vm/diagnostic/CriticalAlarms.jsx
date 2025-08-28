"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CriticalAlarms() {
  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    const fetchCriticalAlarms = async () => {
      try {
        const res = await fetch("/api/vm/alarms?limit=50");
        const data = await res.json();

        const criticalAlarms = data
          .filter((alarm) => alarm.level === "critical" || alarm.level === "alarm")
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 3);

        setAlarms(criticalAlarms);
      } catch (err) {
        console.error("Failed to fetch alarms", err);
      }
    };

    fetchCriticalAlarms();
    const interval = setInterval(fetchCriticalAlarms, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          Last 3 Critical Alarms
        </h2>
      </div>

      {alarms.length === 0 ? (
        <div className="text-green-600 dark:text-green-400">No critical alarms</div>
      ) : (
        <ul className="space-y-2">
          {alarms.map((alarm, i) => (
            <li
              key={i}
              className="flex items-center justify-between bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 px-3 py-2 rounded-lg"
            >
              <Link
                href={`/vm/${alarm.channel}`}
                className="text-sm font-medium text-red-700 dark:text-red-300 hover:underline"
              >
                CH-{alarm.channel}: {alarm.metric}
              </Link>
              <span className="text-xs font-mono text-red-600 dark:text-red-400">
                {alarm.value?.toFixed(2)} @ {formatDistanceToNow(new Date(alarm.timestamp), { addSuffix: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
