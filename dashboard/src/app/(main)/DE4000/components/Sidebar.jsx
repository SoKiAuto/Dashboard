"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  Table,
  LineChart,
  List,
  Globe,
  RefreshCcw,
  Sliders,
  Share2,
} from "lucide-react";

// ✅ Active and upcoming routes for DE4000 section
const navItems = [
  { name: "Dashboard", href: "/DE4000/dashboard", icon: Gauge, active: true },
  { name: "Values", href: "/DE4000/values", icon: Table, active: true },
  { name: "Trends", href: "/DE4000/trends", icon: LineChart, active: true },
  { name: "Events", href: "/DE4000/events", icon: List, active: true },
  { name: "Global", href: "/DE4000/global", icon: Globe, active: false },
  { name: "Start-Up", href: "/DE4000/startup", icon: RefreshCcw, active: false },
  { name: "Channels", href: "/DE4000/channels", icon: Sliders, active: false },
  { name: "Outputs", href: "/DE4000/outputs", icon: Share2, active: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-25 bg-black text-gray-300 flex flex-col py-4 space-y-3 items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const isEnabled = item.active;

        // 🔒 Disabled style
        const disabledStyle = "opacity-40 cursor-not-allowed bg-[#1a1a1a] border border-[#333]";
        const enabledStyle = isActive
          ? "bg-[#25458C] text-white"
          : "bg-[#212121] text-[#BDB8AE] hover:bg-[#6FA0BD] hover:text-white";

        return isEnabled ? (
          // 🔹 Enabled buttons (active pages)
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center h-20 w-25 text-xm font-medium transition-colors rounded-sm ${enabledStyle}`}
          >
            <Icon className="h-7 w-7 mb-1" />
            {item.name}
          </Link>
        ) : (
          // 🔒 Disabled buttons (future features)
          <div
            key={item.name}
            className={`flex flex-col items-center justify-center h-20 w-25 text-xm font-medium rounded-sm ${disabledStyle}`}
            title="Feature coming soon"
          >
            <Icon className="h-7 w-7 mb-1" />
            {item.name}
          </div>
        );
      })}
    </aside>
  );
}
