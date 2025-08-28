// src/app/api/vm/history/route.js
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
};

const getModel = (name) => {
  const schema = new mongoose.Schema({}, { strict: false });
  return mongoose.models[name] || mongoose.model(name, schema, name);
};

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const rawChannel = url.searchParams.get("channel");
    const range = url.searchParams.get("range");

    if (!rawChannel) {
      return NextResponse.json({ error: "Missing ?channel= param" }, { status: 400 });
    }

    const channel = isNaN(rawChannel) ? rawChannel : parseInt(rawChannel);
    const SensorModel = getModel("Sentinel-VM_history_data");

    let query = {
      source: "Sentinel-VM",
      channel: channel,
    };

    if (range === "live") {
      // Return last 20 values
      const data = await SensorModel.find(query)
        .sort({ timestamp: -1 }) // newest first
        .limit(20);
      return NextResponse.json(data.reverse()); // reverse to show oldest first
    }

    if (range) {
      const now = new Date();
      let fromTime = new Date(now);

      switch (range) {
        case "15min":
          fromTime.setMinutes(now.getMinutes() - 15);
          break;
        case "1h":
          fromTime.setHours(now.getHours() - 1);
          break;
        case "6h":
          fromTime.setHours(now.getHours() - 6);
          break;
        case "24h":
          fromTime.setDate(now.getDate() - 1);
          break;
        case "7d":
          fromTime.setDate(now.getDate() - 7);
          break;
      }

      query.timestamp = { $gte: fromTime, $lte: now };
    }

    const data = await SensorModel.find(query)
      .sort({ timestamp: 1 }) // oldest first
      .limit(200);

    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ History API error:", err);
    return NextResponse.json({ error: "History fetch failed" }, { status: 500 });
  }
}
