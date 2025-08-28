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

    const { searchParams } = new URL(req.url);
    let cylinder = searchParams.get("cylinder");
    const date = searchParams.get("date"); // ✅ NEW: Selected date from client

    if (!cylinder) {
      return NextResponse.json(
        { error: "Cylinder parameter is required" },
        { status: 400 }
      );
    }

    // ✅ Normalize cylinder key
    if (cylinder.startsWith("cylinder_")) {
      cylinder = cylinder.split("_")[1];
    }

    const CPMHistoryModel = getModel("Sentinel-CPM_history_data");

    let query = {};
  if (date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  query.timestamp = { $gte: startOfDay, $lte: endOfDay };
} else if (searchParams.get("start") && searchParams.get("end")) {
  const start = new Date(searchParams.get("start"));
  start.setHours(0, 0, 0, 0);
  const end = new Date(searchParams.get("end"));
  end.setHours(23, 59, 59, 999);
  query.timestamp = { $gte: start, $lte: end };
}


    // ✅ Fetch data
    const history = await CPMHistoryModel.find(query)
      .sort({ timestamp: -1 })
      .limit(date ? 0 : 20); // If day selected → return ALL records

    // ✅ Filter cylinder-specific data only
    const filteredHistory = history.filter(
      (doc) => doc.values?.cylinders?.[`cylinder_${cylinder}`]
    );

    return NextResponse.json(filteredHistory);
  } catch (err) {
    console.error("❌ CPM History API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch CPM history" },
      { status: 500 }
    );
  }
}
