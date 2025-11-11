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

// ✅ Updated routes for DE4000 section
const navItems = [
  { name: "Dashboard", href: "/DE4000/dashboard", icon: Gauge },
  { name: "Values", href: "/DE4000/values", icon: Table },
  { name: "Trends", href: "/DE4000/trends", icon: LineChart },
  { name: "Events", href: "/DE4000/events", icon: List },
  { name: "Global", href: "/DE4000/global", icon: Globe },
  { name: "Start-Up", href: "/DE4000/startup", icon: RefreshCcw },
  { name: "Channels", href: "/DE4000/channels", icon: Sliders },
  { name: "Outputs", href: "/DE4000/outputs", icon: Share2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-30 bg-black text-gray-300 flex flex-col py-4 space-y-3 items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center h-20 w-25 text-xm font-medium transition-colors rounded-sm ${
              active
                ? "bg-[#25458C] text-white"
                : "bg-[#212121] text-[#BDB8AE] hover:bg-[#6FA0BD] hover:text-white"
            }`}
          >
            <Icon className="h-7 w-7 mb-1" />
            {item.name}
          </Link>
        );
      })}
    </aside>
  );
}
