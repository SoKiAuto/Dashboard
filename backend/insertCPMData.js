// backend/insertCPMData.js
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const DATA_FILE = path.join(__dirname, "socketdata.json");
const MONGO_URI = "mongodb://localhost:27017"; // update if needed
const DB_NAME = "wi_controller"; // replace with your DB name
const COLLECTION = "CPM_Data";

async function run() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);
  
    // Load JSON snapshot
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);

    // Insert/update each section
    await col.updateOne(
      { _id: "DeviceInfo" },
      { $set: { data: data.updatePrimary } },
      { upsert: true }
    );

    await col.updateOne(
      { _id: "CompressorData" },
      { $set: { data: data.cpmCalc } },
      { upsert: true }
    );

    await col.updateOne(
      { _id: "ModbusData" },
      { $set: { data: data.modbusData } },
      { upsert: true }
    );

    await col.updateOne(
      { _id: "Status" },
      { $set: { data: data.systemStatus } },
      { upsert: true }
    );

    // Handle Curve Data
    const cylinders = (data.newCurve || []).map((cyl, idx) => ({
      cylinder: idx + 1,
      CERaw: cyl.CERaw,
      CESmoothed: cyl.CESmoothed,
      CETheoretical: cyl.CETheoretical,
      HERaw: cyl.HERaw,
      HESmoothed: cyl.HESmoothed,
      HETheoretical: cyl.HETheoretical,
    }));

    await col.updateOne(
      { _id: "CurveData" },
      { $set: { cylinders } },
      { upsert: true }
    );

    console.log("✅ Data inserted/updated into CPM_Data");
  } catch (err) {
    console.error("❌ Error inserting data:", err);
  } finally {
    await client.close();
  }
}

run();
