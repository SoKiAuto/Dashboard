// dashboard/src/app/api/vm/alarms/route.js
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Alarm Schema with resolvedAt
const AlarmSchema = new mongoose.Schema(
  {
    channel: Number,
    metric: String,
    level: String, // "warning" | "alarm"
    value: Number,
    threshold: Number,
    message: String,
    timestamp: Date,
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null }, // ✅ New field
  },
  { collection: "Sentinel-VM_alarms", versionKey: false }
);

// Prevent model overwrite in dev
const AlarmModel =
  mongoose.models["SentinelVM_Alarm"] ||
  mongoose.model("SentinelVM_Alarm", AlarmSchema);

// GET /api/vm/alarms?channel=1&level=warning
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const channel = searchParams.get("channel");
    const level = searchParams.get("level");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const limit = parseInt(searchParams.get("limit")) || 100;

    const query = {};
    if (channel) query.channel = parseInt(channel);
    if (level) query.level = level;
    if (start && end) {
      query.timestamp = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const alarms = await AlarmModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json(alarms);
  } catch (err) {
    console.error("❌ Error fetching alarms:", err);
    return NextResponse.json({ error: "Failed to fetch alarms" }, { status: 500 });
  }
}

