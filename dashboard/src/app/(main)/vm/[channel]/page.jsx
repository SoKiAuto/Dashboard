// dashboard/src/app/(main)/vm/[channel]/page.jsx
"use client";
import { useParams } from "next/navigation";
import { useLiveData } from "@/context/liveContext";
import MetricChart from "@/components/MetricChart";
import WaveformRMSChart from "@/components/WaveformRMSChart";
import FFTRMSChart from "@/components/FFTRMSChart";
import BiasVoltageChart from "@/components/BiasVoltageChart";
import RodDropChart from "@/components/RodDropChart";
import RPMChart from "@/components/RPMChart";
import BackToVMButton from "@/components/BackToVMButton";  // ✅ NEW


export default function ChannelPage() {
  const { channel } = useParams();
  const { liveData, setpoints } = useLiveData();

  if (!liveData) return <p className="p-4">Loading…</p>;

  const chNum = Number(channel);
  const isRPM = channel === "RPM";
  const hasBias = chNum >= 1 && chNum <= 8;
  const hasRod = chNum >= 9 && chNum <= 12;

  return (
     <div className="p-8 space-y-12 min-h-screen w-full">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Channel {channel}</h1>
        <BackToVMButton />
      </div>
      
      {isRPM && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RPMChart channel={channel} liveData={liveData} />
        </div>
      )}

      {hasBias && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricChart channel={channel} liveData={liveData} setpoints={setpoints} />
          <WaveformRMSChart channel={channel} liveData={liveData} setpoints={setpoints} />
          <FFTRMSChart channel={channel} liveData={liveData} setpoints={setpoints} />
          <BiasVoltageChart channel={channel} liveData={liveData} setpoints={setpoints} />
        </div>
      )}

      {hasRod && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricChart channel={channel} liveData={liveData} setpoints={setpoints} />
          <WaveformRMSChart channel={channel} liveData={liveData} setpoints={setpoints} />
          <FFTRMSChart channel={channel} liveData={liveData} setpoints={setpoints} />
          <RodDropChart channel={channel} liveData={liveData} setpoints={setpoints} />
        </div>
      )}
    </div>
  );
}
