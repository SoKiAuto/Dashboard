// src/app/api/vm/live/route.js
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

export async function GET() {
  try {
    await connectDB();
    const SensorModel = getModel("Sentinel-VM_live_data");
    const data = await SensorModel.find().sort({ channel: 1 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Live API error:", err);
    return NextResponse.json({ error: "Live fetch failed" }, { status: 500 });
  }
}
