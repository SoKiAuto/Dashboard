// ✅ CORRECT WAY using your existing dynamic model function
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const MONGO_URI = process.env.MONGO_URI;

// 1. Connect DB
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
};

// 2. Dynamic Model Generator
const modelCache = new Map();
function getSensorModel(collectionName) {
  if (modelCache.has(collectionName)) return modelCache.get(collectionName);

  const schema = new mongoose.Schema(
    {
      source: String,
      channel: Number,
      timestamp: Date,
      RPM: Number,
      quality: Number,
      values: {
        Overall_RMS: Number,
        Waveform_RMS: Number,
        FFT_RMS: Number,
        Bias_Voltage: Number,
      },
    },
    { collection: collectionName, versionKey: false }
  );

  const model = mongoose.models[collectionName] || mongoose.model(collectionName, schema);
  modelCache.set(collectionName, model);
  return model;
}

// 3. API Route
export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const channelParam = url.searchParams.get("channel");

    const SensorModel = getSensorModel("Sentinel-VM_history");

    let query = { source: "Sentinel-VM" };
    if (channelParam) {
      query.channel = parseInt(channelParam);
    }

    const data = await SensorModel.find(query).sort({ timestamp: -1 }).limit(200);

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ /api/vm/history error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
