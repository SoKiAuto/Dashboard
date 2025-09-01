import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req, { params }) {
  try {
    const { db } = await connectToDatabase();

    const unit = await db.collection("Units").findOne({ unitId: params.unitId });
    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    let vmData = [];
    let cpmData = null;

    // Fetch live VM + CPM data for Unit1
    if (unit.unitId === "UNIT_001") {
      const [vmRes, cpmRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/vm/live`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cpm/live`)
      ]);

      const vmRaw = await vmRes.json();
      const cpmRaw = await cpmRes.json();

      // Format VM data properly
      vmData = vmRaw.map(item => ({
        channel: item.channel,
        name: item.config.location,
        type: item.config.type,
        unit: item.config.unit,
        overall: item.values.Overall_RMS ?? null,
        fft: item.values.FFT_RMS ?? null,
        bias: item.values.Bias_Voltage ?? null,
        quality: item.quality,
        timestamp: item.timestamp
      }));

      // Format CPM data properly
      const cpmValues = cpmRaw?.values || {};
      cpmData = {
        rpm: cpmValues.unit?.Unit_RPM ?? 0,
        hp: cpmValues.unit?.Total_HP ?? 0,
        suction: cpmValues.stages?.stage_1?.Avg_Suction_Pressure_psi ?? 0,
        discharge: cpmValues.stages?.stage_1?.Avg_Discharge_Pressure_psi ?? 0
      };
    }

    return NextResponse.json({
      ...unit,
      vms: vmData,
      cpms: cpmData
    });

  } catch (error) {
    console.error("❌ Units API Error:", error);
    return NextResponse.json({ error: "Failed to fetch unit data" }, { status: 500 });
  }
}
