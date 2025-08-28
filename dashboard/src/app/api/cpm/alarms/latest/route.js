// dashboard/src/app/api/cpm/alarms/latest/route.js
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

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

const CPMAlarmModel =
  mongoose.models["SentinelCPM_Alarm"] ||
  mongoose.model("SentinelCPM_Alarm", CPMAlarmSchema);

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const after = searchParams.get("after");

  let afterDate;
  if (after) {
    afterDate = new Date(after);
    if (isNaN(afterDate.getTime())) {
      return new Response("Invalid 'after' timestamp", { status: 400 });
    }
  } else {
    afterDate = new Date(0);
  }

  const newAlarms = await CPMAlarmModel.find({
    timestamp: { $gt: afterDate },
  })
    .sort({ timestamp: 1 })
    .limit(10);

  return new Response(JSON.stringify(newAlarms), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}
