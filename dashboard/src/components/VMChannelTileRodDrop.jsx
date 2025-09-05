// dashboard/src/components/VMChannelTile_RMSRodDrop.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
// Importing single-color icons from lucide-react
import { Gauge, Activity, TrendingUp, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";

export default function VMChannelTile_RMSRodDrop({ data }) {
  // Destructure data, including 'config' to get 'location'
  const { channel, values = {}, timestamp, config = {} } = data;
  const { location } = config; // Extract location from config

  const { Overall_RMS, Waveform_RMS, FFT_RMS, RodDrop_RMS, RodDrop_PkPk, RodDrop_Min, RodDrop_Max } = values;

  // Helper function to format numerical values to 2 decimal places or "--"
  const format = (v) => (v !== null && v !== undefined ? v.toFixed(2) : "--");

  // Determine status-based styling for the Overall RMS badge and card border
  // Using neutral dark gray for the warning state (Overall_RMS > 10)
  const statusClass =
    Overall_RMS > 11
      ? "bg-destructive border-destructive text-destructive-foreground shadow-lg shadow-destructive/40" // Red for critical
      : Overall_RMS > 10
      ? "bg-gray-700 border-gray-700 text-white shadow-lg shadow-gray-700/40" // Dark Gray for warning (neutral)
      : "bg-green-600 border-green-700 text-white shadow-lg shadow-green-500/40"; // Green for normal

  // Card border class: Uses the same colors as the badge for consistency
  const cardBorderClass =
    Overall_RMS > 11
      ? "border-destructive"
      : Overall_RMS > 10
      ? "border-gray-700" // Dark Gray border for warning
      : "border-green-600";

  return (
    <Link href={`/vm/${channel}`}>
      {/* Enhanced Card: Clean border, subtle internal gradient, and pronounced shadow */}
      <Card
        className={`relative overflow-hidden border-2 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ${cardBorderClass} bg-card`}
      >
        {/* Subtle background gradient for a futuristic feel (internal, not border) */}
        <div className="absolute inset-0 bg-gradient-to-br from-card to-card-foreground opacity-5 rounded-xl"></div>
        <CardContent className="p-5 space-y-4 z-10 relative">
          {/* Header section with Channel name, Location, and highlighted Overall RMS */}
          <div className="flex justify-between items-start border-b border-border/50 pb-3">
            {/* Channel and Location: Increased prominence for Channel, added Location */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-extrabold text-foreground leading-tight">
                Channel {channel}
              </h2>
              {location && ( // Only display location if it exists
                <p className="text-xl text-muted-foreground mt-1">
                  {location}
                </p>
              )}
            </div>

            {/* Overall_RMS Badge: Larger, bolder, with a single-color icon and shadow */}
            <div
              className={`flex items-center space-x-2 ${statusClass} px-4 py-2 rounded-full font-bold text-xl backdrop-blur-sm`}
            >
              <Gauge className="w-6 h-6" /> {/* Single-color Gauge icon */}
              <span>{format(Overall_RMS)} RMS</span>
            </div>
          </div>

          {/* Detailed metrics section with single-color icons */}
          <div className="space-y-2 text-base text-muted-foreground">
            <p className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-accent-foreground" /> {/* Single-color Activity icon */}
              <span>
                Waveform RMS:{" "}
                <strong className="text-foreground">
                  {format(Waveform_RMS)}
                </strong>
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-accent-foreground" /> {/* Single-color TrendingUp icon */}
              <span>
                FFT RMS:{" "}
                <strong className="text-foreground">{format(FFT_RMS)}</strong>
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-accent-foreground" /> {/* Single-color Gauge icon for RMS */}
              <span>
                Rod Drop RMS:{" "}
                <strong className="text-foreground">
                  {format(RodDrop_RMS)}
                </strong>
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-accent-foreground" /> {/* Single-color ArrowUpDown icon */}
              <span>
                Rod Drop Pk-Pk:{" "}
                <strong className="text-foreground">
                  {format(RodDrop_PkPk)}
                </strong>
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <ArrowDown className="w-5 h-5 text-accent-foreground" /> {/* Single-color ArrowDown icon */}
              <span>
                Min:{" "}
                <strong className="text-foreground">
                  {format(RodDrop_Min)}
                </strong>
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <ArrowUp className="w-5 h-5 text-accent-foreground" /> {/* Single-color ArrowUp icon */}
              <span>
                Max:{" "}
                <strong className="text-foreground">
                  {format(RodDrop_Max)}
                </strong>
              </span>
            </p>
          </div>

          {/* Timestamp for last update */}
          <p className="text-xs text-muted-foreground pt-2 text-right">
            Last Update: {new Date(timestamp).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
