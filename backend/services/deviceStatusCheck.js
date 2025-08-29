const mongoose = require("mongoose");
const connectDB = require("../db/mongo");

const DeviceStatus = mongoose.connection.collection("Device_Status");

// Keep track of previous status for each device
const previousStatuses = {};

/**
 * Generic device monitor
 * @param {string} deviceId - Unique ID of the device (e.g., 'sentinel-cpm')
 * @param {string} deviceName - Display name (e.g., 'Sentinel CPM')
 * @param {string} collectionName - Live data collection name
 * @param {number} timeoutLimit - Time in ms to detect comm break (default 20s)
 */
async function monitorDeviceStatus(deviceId, deviceName, collectionName, timeoutLimit = 20000) {
  await connectDB();
  const LiveData = mongoose.connection.collection(collectionName);

  setInterval(async () => {
    try {
      // 1️⃣ Get last inserted document
      const latestData = await LiveData.find({})
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();

      if (!latestData || latestData.length === 0) {
        console.warn(`⚠️ No live data found for ${deviceName}!`);
        return;
      }

      const lastTimestamp = new Date(latestData[0].timestamp).getTime();
      const now = Date.now();
      const diff = now - lastTimestamp;

      // 2️⃣ Check if data is stale
      const isOnline = diff <= timeoutLimit;
      const newStatus = isOnline ? "online" : "offline";

      // 3️⃣ Update Device_Status collection
      await DeviceStatus.updateOne(
        { deviceId },
        {
          $set: {
            deviceId,
            deviceName,
            status: newStatus,
            lastUpdated: new Date(),
          },
        },
        { upsert: true }
      );

      // 4️⃣ Log only when status changes
      if (!(deviceId in previousStatuses)) {
        // First time → log initial status
        console.log(
          `[${deviceName} STATUS] ${isOnline ? "🟢 ONLINE" : "🔴 OFFLINE"} | Last: ${new Date(
            lastTimestamp
          ).toLocaleTimeString()}`
        );
      } else if (previousStatuses[deviceId] !== newStatus) {
        // Status changed → log event
        if (isOnline) {
          console.log(`✅ COMM BREAK RESOLVED: ${deviceName} device ONLINE`);
        } else {
          console.log(`❌ COMMUNICATION BREAK: ${deviceName} device OFFLINE`);
        }
      }

      // 5️⃣ Save current status for future checks
      previousStatuses[deviceId] = newStatus;
    } catch (err) {
      console.error(`❌ ${deviceName} Status Monitor Error:`, err.message);
    }
  }, 5000); // Check every 5 sec
}

module.exports = { monitorDeviceStatus };
