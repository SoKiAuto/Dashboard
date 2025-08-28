// src/app/api/vm/alarms/latest/route.js
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

const AlarmSchema = new mongoose.Schema(
  {
    channel: Number,
    metric: String,
    level: String,
    value: Number,
    threshold: Number,
    message: String,
    timestamp: Date,
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
  },
  { collection: "Sentinel-VM_alarms", versionKey: false }
);

const AlarmModel =
  mongoose.models["SentinelVM_Alarm"] ||
  mongoose.model("SentinelVM_Alarm", AlarmSchema);

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
    afterDate = new Date(0); // default very old date
  }

  const newAlarms = await AlarmModel.find({ timestamp: { $gt: afterDate } })
    .sort({ timestamp: 1 }) // oldest first
    .limit(10);

  return new Response(JSON.stringify(newAlarms), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}
