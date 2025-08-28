// dashboard\src\components\VMChannelTile.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
// Assuming you have a way to get icons, or you can use simple text for now
// import { /* icon imports */ } from 'lucide-react'; // Example: npm install lucide-react

export default function VMChannelTile({ data, rpmOnly = false }) {
  if (!data) return null;

  const { channel, values = {}, timestamp } = data;
  const {
    Overall_RMS,
    Waveform_RMS,
    FFT_RMS,
    Bias_Voltage,
    RodDrop_RMS,
    RodDrop_PkPk,
    RodDrop_Min,
    RodDrop_Max,
    RPM,
  } = values;

  // Function to format numbers for display
  const formatValue = (value) => (value !== undefined && value !== null ? value.toFixed(2) : "--");

  if (rpmOnly) {
    return (
      <Card className="w-full shadow-md border border-indigo-600 rounded-xl bg-indigo-50 text-center flex flex-col justify-center items-center p-6">
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-bold text-indigo-700">Machine RPM</h2>
          <p className="text-5xl font-extrabold text-indigo-900 leading-none">
            {formatValue(RPM)}
          </p>
          <p className="text-lg text-indigo-600">RPM</p>
          <p className="text-sm text-muted-foreground mt-2">
            Updated: {new Date(timestamp).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusColorClass =
    Overall_RMS > 20
      ? "bg-red-600 border-red-700 text-white"
      : Overall_RMS > 10
      ? "bg-yellow-500 border-yellow-600 text-black"
      : "bg-green-600 border-green-700 text-white";

  const cardBorderClass =
    Overall_RMS > 20
      ? "border-red-500"
      : Overall_RMS > 10
      ? "border-yellow-400"
      : "border-gray-200"; // Default border

  return (
    <Link href={`/vm/${channel}`} className="block">
      <Card className={`w-full shadow-md rounded-xl hover:shadow-xl transition-all duration-200 ease-in-out ${cardBorderClass} border-2`}>
        <CardContent className="p-5 space-y-4">
          {/* Header with Channel and Main Status */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Channel {channel}</h2>
            <Badge className={`px-4 py-1.5 text-base font-semibold ${statusColorClass}`}>
              RMS: {formatValue(Overall_RMS)}
            </Badge>
          </div>

          {/* Key Vibration Metrics */}
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="col-span-2 text-gray-600 font-semibold mb-1">Vibration</div>
            <div className="flex items-center gap-2">
                {/* Icon for Waveform RMS if available */}
                <span className="text-gray-500">📈</span>
                <span>Waveform RMS:</span>
            </div>
            <span className="font-medium text-right">{formatValue(Waveform_RMS)}</span>

            <div className="flex items-center gap-2">
                {/* Icon for FFT RMS if available */}
                <span className="text-gray-500">📊</span>
                <span>FFT RMS:</span>
            </div>
            <span className="font-medium text-right">{formatValue(FFT_RMS)}</span>
          </div>

          {/* Bias Voltage */}
          <div className="flex items-center justify-between text-sm py-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 font-semibold">
                {/* Icon for Bias Voltage if available */}
                <span className="text-gray-500">⚡</span>
                <span>Bias Voltage:</span>
            </div>
            <span className="font-medium">{formatValue(Bias_Voltage)} V</span>
          </div>

          {/* Rod Drop Metrics */}
          <div className="grid grid-cols-2 gap-y-2 text-sm pt-2 border-t border-gray-100">
            <div className="col-span-2 text-gray-600 font-semibold mb-1">Rod Drop</div>
            <div className="flex items-center gap-2">
                {/* Icon for RodDrop RMS if available */}
                <span className="text-gray-500">🔽</span>
                <span>RMS:</span>
            </div>
            <span className="font-medium text-right">{formatValue(RodDrop_RMS)}</span>

            <div className="flex items-center gap-2">
                {/* Icon for RodDrop Pk-Pk if available */}
                <span className="text-gray-500">↕️</span>
                <span>Pk-Pk:</span>
            </div>
            <span className="font-medium text-right">{formatValue(RodDrop_PkPk)}</span>

            <div className="flex items-center gap-2">
                {/* Icon for RodDrop Min if available */}
                <span className="text-gray-500">⬇️</span>
                <span>Min:</span>
            </div>
            <span className="font-medium text-right">{formatValue(RodDrop_Min)}</span>

            <div className="flex items-center gap-2">
                {/* Icon for RodDrop Max if available */}
                <span className="text-gray-500">⬆️</span>
                <span>Max:</span>
            </div>
            <span className="font-medium text-right">{formatValue(RodDrop_Max)}</span>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground pt-3 border-t border-gray-100">
            Last Updated: {new Date(timestamp).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}