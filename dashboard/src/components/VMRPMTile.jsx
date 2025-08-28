// dashboard/src/components/VMChannelTile_RPM.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Gauge } from "lucide-react"; // Single-color icon for RPM

export default function VMChannelTile_RPM({ data }) {
  // Destructure data, including 'channel' and 'config' to get 'location'
  const { channel, values = {}, timestamp, config = {} } = data;
  const { RPM } = values;
  const { location } = config; // Extract location from config

  // Helper function to format numerical values to 0 decimal places or "--"
  const format = (v) => (v !== null && v !== undefined ? v.toFixed(0) : "--");

  // For RPM tile, we'll use a consistent neutral gray for the badge and border
  // as there's no explicit status logic (like Overall_RMS thresholds) provided.
  const neutralStatusClass = "bg-gray-700 border-gray-700 text-white shadow-lg shadow-gray-700/40";
  const neutralCardBorderClass = "border-gray-700";

  return (
    <Link href={`/vm/${channel}`}>
      {/* Enhanced Card: Clean border, subtle internal gradient, and pronounced shadow */}
      <Card
        className={`relative overflow-hidden border-2 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ${neutralCardBorderClass} bg-card`}
      >
        {/* Subtle background gradient for a futuristic feel (internal, not border) */}
        <div className="absolute inset-0 bg-gradient-to-br from-card to-card-foreground opacity-5 rounded-xl"></div>
        <CardContent className="p-5 space-y-4 z-10 relative">
          {/* Header section with Channel name, Location, and highlighted RPM */}
          <div className="flex justify-between items-start border-b border-border/50 pb-3">
            {/* Channel and Location: Increased prominence for Channel, added Location */}
            <div className="flex flex-col">
              <h2 className="text-3xl font-extrabold text-foreground leading-tight">
                Channel {channel}
              </h2>
              {location && ( // Only display location if it exists
                <p className="text-sm text-muted-foreground mt-1">
                  {location}
                </p>
              )}
            </div>

            {/* RPM Badge: Prominent, with a single-color icon and shadow */}
            <div
              className={`flex items-center space-x-2 ${neutralStatusClass} px-4 py-2 rounded-full font-bold text-xl backdrop-blur-sm`}
            >
              <Gauge className="w-6 h-6" /> {/* Single-color Gauge icon for RPM */}
              <span>{format(RPM)} RPM</span>
            </div>
          </div>

          {/* Main RPM value display */}
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-6xl font-extrabold text-foreground leading-none">
              {format(RPM)}
            </p>
            <p className="text-xl text-muted-foreground mt-2">
              Revolutions Per Minute
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
