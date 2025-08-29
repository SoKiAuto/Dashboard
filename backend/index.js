require('dotenv').config(); // load .env once
const connectDB = require('./db/mongo');
const mongoose = require("mongoose");

async function start() {
  await connectDB();

  // Start Sentinel-VM poller
     const startSentinelVM = require('./poller/sentinel-vm');
    startSentinelVM();

  // Start Sentinel-CPM poller
     const startSentinelCPM = require("./poller/sentinel-cpm");
     startSentinelCPM();


  // In future: Add CPM poller, DE-4000, API server, etc.
  // const startCPM = require('./poller/sentinel-cpm');
  // startCPM();

  // const startApiServer = require('./api/server');
  // startApiServer();

    // ✅ Start Device Status Monitors
  const { monitorDeviceStatus } = require("./services/deviceStatusCheck");

  // Monitor Sentinel CPM status
  monitorDeviceStatus("sentinel-cpm", "Sentinel CPM", "Sentinel-CPM_live_data");

  // Monitor Sentinel VM status
  monitorDeviceStatus("sentinel-vm", "Sentinel VM", "Sentinel-VM_live_data");



  console.log('🚀 All modules started');
}

start();



/**
 * 🛑 Graceful Shutdown Handler
 */
process.on("SIGINT", async () => {
  console.log("\n⚠️  Shutting down... Marking devices as OFFLINE");
  try {
    const DeviceStatus = mongoose.connection.collection("Device_Status");
    await DeviceStatus.updateMany({}, { $set: { status: "offline", lastUpdated: new Date() } });
    console.log("🔴 All devices marked OFFLINE due to backend shutdown.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error marking devices offline:", err);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n⚠️  Process terminated... Marking devices as OFFLINE");
  const DeviceStatus = mongoose.connection.collection("Device_Status");
  await DeviceStatus.updateMany({}, { $set: { status: "offline", lastUpdated: new Date() } });
  console.log("🔴 All devices marked OFFLINE due to backend termination.");
  process.exit(0);
});