// dashboard/src/app/api/cpm/alarms/route.js
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// ✅ CPM Alarm Schema
const CPMAlarmSchema = new mongoose.Schema(
  {
    parameter: { type: String, required: true },
    value: Number,
    threshold: Number,
    level: { type: String, enum: ["warning", "alarm"] },
    message: String,
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
  },
  { collection: "Sentinel-CPM_alarms", versionKey: false }
);

// ✅ Prevent model overwrite in dev mode
const CPMAlarmModel =
  mongoose.models["SentinelCPM_Alarm"] ||
  mongoose.model("SentinelCPM_Alarm", CPMAlarmSchema);

// ✅ GET /api/cpm/alarms?unit=1&stage=2&cylinder=3&level=alarm
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const unit = searchParams.get("unit");
    const stage = searchParams.get("stage");
    const cylinder = searchParams.get("cylinder");
    const level = searchParams.get("level");
    const resolved = searchParams.get("resolved");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const limit = parseInt(searchParams.get("limit")) || 100;

    const query = {};

    // ✅ Filter by unit
    if (unit) query.parameter = new RegExp(`^unit\\.${unit}`, "i");

    // ✅ Filter by stage
    if (stage) query.parameter = new RegExp(`^stages\\.stage_${stage}`, "i");

    // ✅ Filter by cylinder
    if (cylinder) query.parameter = new RegExp(`^cylinders\\.cylinder_${cylinder}`, "i");

    // ✅ Filter by warning/alarm
    if (level) query.level = level;

    // ✅ Filter by resolved/active
    if (resolved === "true") query.resolved = true;
    if (resolved === "false") query.resolved = false;

    // ✅ Date range filter
    if (start && end) {
      query.timestamp = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const alarms = await CPMAlarmModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json(alarms);
  } catch (err) {
    console.error("❌ Error fetching CPM alarms:", err);
    return NextResponse.json(
      { error: "Failed to fetch CPM alarms" },
      { status: 500 }
    );
  }
}
