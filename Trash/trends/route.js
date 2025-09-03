import mongoose from "mongoose";
import { NextResponse } from "next/server";

// --- DB helpers ---
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

// --- utils ---
const toDate = (v) => (v ? new Date(v) : null);
const validDate = (d) => d instanceof Date && !isNaN(d.getTime());

/**
 * Resample by interval buckets.
 * interval: "1m" | "5m" | "15m" | "1h" | "1d"
 * agg: average per bucket (simple)
 */
function bucketTimestamp(date, interval) {
  const d = new Date(date);
  if (!validDate(d)) return null;
  const I = interval || "1m";
  const m = d.getUTCMinutes();
  const s = d.getUTCSeconds();
  d.setUTCSeconds(0, 0);
  if (I === "1m") return d;
  if (I === "5m") d.setUTCMinutes(m - (m % 5));
  else if (I === "15m") d.setUTCMinutes(m - (m % 15));
  else if (I === "1h") d.setUTCMinutes(0);
  else if (I === "1d") {
    d.setUTCHours(0, 0, 0, 0);
  }
  return d;
}

function avgReduce(records) {
  const out = {};
  for (const key of Object.keys(records)) {
    const arr = records[key];
    const vals = arr.filter((v) => typeof v === "number");
    out[key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  return out;
}

function pushKey(holder, key, val) {
  if (!holder[key]) holder[key] = [];
  holder[key].push(val);
}

/**
 * Body (POST):
 * {
 *   level: "unit" | "cylinder" | "stage" | "custom",
 *   start: ISO, end: ISO,
 *   interval: "1m" | "5m" | "15m" | "1h" | "1d",
 *   cylinders: ["1","2"],   // when level=cylinder/custom
 *   stages: ["1","2"],      // when level=stage/custom
 *   metrics: [
 *     // each becomes a series in response
 *     // pick ONE of:
 *     // unit metric:
 *     { label: "Total HP", path: "unit.Total_HP" },
 *     // cylinder metric:
 *     { label: "C1 Head HP", path: "cylinders.cylinder_1.head_end.HP" },
 *     // stage metric:
 *     { label: "Stage 1 Flow", path: "stages.stage_1.Flow_MMSCFD" }
 *   ]
 * }
 *
 * Response:
 * [
 *   { timestamp: "...", "<seriesKey1>": 123, "<seriesKey2>": 456, ... }
 * ]
 */

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));

    const level = (body.level || "unit").toLowerCase();
    const start = toDate(body.start);
    const end = toDate(body.end);
    const interval = body.interval || "1m";
    const metrics = Array.isArray(body.metrics) ? body.metrics : [];

    if (!metrics.length) {
      return NextResponse.json({ error: "metrics array is required" }, { status: 400 });
    }
    if (start && !validDate(start)) {
      return NextResponse.json({ error: "Invalid start" }, { status: 400 });
    }
    if (end && !validDate(end)) {
      return NextResponse.json({ error: "Invalid end" }, { status: 400 });
    }

    const CPMHistoryModel = getModel("Sentinel-CPM_history_data");
    const query = {};
    if (start && end) query.timestamp = { $gte: start, $lte: end };

    const docs = await CPMHistoryModel.find(query).sort({ timestamp: 1 }).lean();

    // build buckets
    const buckets = new Map(); // key: ISO, value: { accum: {seriesKey: [vals...]}}
    for (const doc of docs) {
      const bTs = bucketTimestamp(doc.timestamp, interval);
      if (!bTs) continue;
      const bucketKey = bTs.toISOString();
      if (!buckets.has(bucketKey)) buckets.set(bucketKey, { accum: {} });

      for (const m of metrics) {
        // series key = provided label (safe fallback to path)
        const seriesKey = m.label || m.path;
        const val = deepRead(doc.values, m.path);
        pushKey(buckets.get(bucketKey).accum, seriesKey, typeof val === "number" ? val : null);
      }
    }

    // finalize buckets with average per series
    const result = [];
    for (const [iso, obj] of buckets.entries()) {
      const averaged = avgReduce(obj.accum);
      result.push({ timestamp: iso, ...averaged });
    }

    // Ensure chronological order
    result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ /api/cpm/trends POST error:", err);
    return NextResponse.json({ error: "Failed to fetch CPM trends" }, { status: 500 });
  }
}

// Optional simple GET for quick checks:
// /api/cpm/trends?level=unit&metric=unit.Total_HP&limit=300
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const level = (searchParams.get("level") || "unit").toLowerCase();
    const metric = searchParams.get("metric"); // dot path e.g. "unit.Total_HP"
    const limit = Number(searchParams.get("limit") || 500);

    if (!metric) {
      return NextResponse.json({ error: "metric is required" }, { status: 400 });
    }

    const CPMHistoryModel = getModel("Sentinel-CPM_history_data");
    const docs = await CPMHistoryModel.find({})
      .sort({ timestamp: 1 })
      .limit(limit)
      .lean();

    const path = metric;
    const rows = docs.map((doc) => ({
      timestamp: doc.timestamp,
      series: deepRead(doc.values, path),
    }));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("❌ /api/cpm/trends GET error:", err);
    return NextResponse.json({ error: "Failed to fetch CPM trends" }, { status: 500 });
  }
}

// Safe deep reader: dot-path under values.* (unit|cylinders|stages...)
function deepRead(values, dotPath) {
  if (!values || !dotPath) return null;
  const parts = dotPath.split(".");
  let cur = values;
  for (const p of parts) {
    if (cur == null) return null;
    cur = cur[p];
  }
  if (typeof cur === "number") return cur;
  return cur ?? null;
}
