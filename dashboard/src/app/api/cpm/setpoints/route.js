import mongoose from "mongoose";
import { NextResponse } from "next/server";

const MONGO_URI = process.env.MONGO_URI;

// Connect DB
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
};

// Cached model
const modelCache = new Map();
function getSetpointModel(collectionName) {
  if (modelCache.has(collectionName)) return modelCache.get(collectionName);

  const schema = new mongoose.Schema(
    {
      unit: mongoose.Schema.Types.Mixed,
      cylinders: mongoose.Schema.Types.Mixed,
      stages: mongoose.Schema.Types.Mixed,
    },
    { collection: collectionName, versionKey: false }
  );

  const model =
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, schema);
  modelCache.set(collectionName, model);
  return model;
}

// GET handler
export async function GET() {
  try {
    await connectDB();
    const Setpoint = getSetpointModel("Sentinel-CPM_setpoints");
    const result = await Setpoint.findOne().sort({ createdAt: -1 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ Error fetching CPM setpoints:", err);
    return NextResponse.json(
      { error: "Failed to fetch CPM setpoints" },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { section, keyPath, updateData } = body;

    if (!section || !keyPath || !updateData) {
      return NextResponse.json(
        { error: "Section, keyPath, and updateData are required" },
        { status: 400 }
      );
    }

    const Setpoint = getSetpointModel("Sentinel-CPM_setpoints");

    // Construct the dynamic key for the update
    const updateKey = `${section}.${keyPath.join(".")}`;

    const updated = await Setpoint.findOneAndUpdate(
      {},
      { $set: { [updateKey]: updateData } },
      { new: true, upsert: false }
    );

    if (!updated) {
      return NextResponse.json({ error: "No CPM setpoints document found to update" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("❌ Error updating CPM setpoints:", err);
    return NextResponse.json(
      { error: "Failed to update CPM setpoints" },
      { status: 500 }
    );
  }
}