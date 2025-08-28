// dashboard/src/app/api/vm/setpoints/route.js
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const MONGO_URI = process.env.MONGO_URI;

// Connect DB
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
};

// Create model cache
const modelCache = new Map();
function getSetpointModel(collectionName) {
  if (modelCache.has(collectionName)) return modelCache.get(collectionName);

  const schema = new mongoose.Schema(
    {
      channel: Number,
      Overall_RMS: {
        baseline: Number,
        warning: Number,
        alarm: Number,
      },
      Waveform_RMS: {
        warning: Number,
        alarm: Number,
      },
      FFT_RMS: {
        warning: Number,
        alarm: Number,
      },
      Bias_Voltage: {
        min: Number,
        max: Number,
      },
    },
    { collection: collectionName, versionKey: false }
  );

  const model =
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, schema);
  modelCache.set(collectionName, model);
  return model;
}

// GET handler (all or specific channel)
export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const channelParam = url.searchParams.get("channel");
    const Setpoint = getSetpointModel("Sentinel-VM_setpoints");

    let result;
    if (channelParam) {
      result = await Setpoint.findOne({ channel: parseInt(channelParam) });
    } else {
      result = await Setpoint.find().sort({ channel: 1 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ Error fetching setpoints:", err);
    return NextResponse.json(
      { error: "Failed to fetch setpoints" },
      { status: 500 }
    );
  }
}

// PUT handler (update channel setpoints)
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { channel, ...update } = body;
    if (!channel) {
      return NextResponse.json({ error: "Channel is required" }, { status: 400 });
    }

    const Setpoint = getSetpointModel("Sentinel-VM_setpoints");
    const updated = await Setpoint.findOneAndUpdate(
      { channel },
      { $set: update },
      { new: true, upsert: false }
    );

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ Error updating setpoint:", err);
    return NextResponse.json(
      { error: "Failed to update setpoint" },
      { status: 500 }
    );
  }
}