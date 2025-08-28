// dashboard/src/app/api/cpm/live/route.js
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB once
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

// Dynamic model getter (avoids schema duplication issues)
const getModel = (name) => {
  const schema = new mongoose.Schema({}, { strict: false });
  return mongoose.models[name] || mongoose.model(name, schema, name);
};

export async function GET() {
  try {
    await connectDB();

    // Our CPM live data is stored in this collection
    const CPMModel = getModel("Sentinel-CPM_live_data");

    // Get the latest structured document only (exclude RAW)
    const latestDoc = await CPMModel
      .findOne({ channel: "STRUCT" }) // fetch processed hierarchical data
      .sort({ timestamp: -1 }) // get latest document
      .lean();

    if (!latestDoc) {
      return NextResponse.json(
        { error: "No structured CPM data available" },
        { status: 404 }
      );
    }

    // Return the latest structured data
    return NextResponse.json(latestDoc);
  } catch (err) {
    console.error("❌ CPM Live API Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch CPM live data" },
      { status: 500 }
    );
  }
}
