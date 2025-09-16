const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { io } = require("socket.io-client");

const CPMliveService = require(path.join(__dirname, "services/CPMliveService"));
const logger = require(path.join(__dirname, "utils/logger"));

// ---------------- [ DATABASE CONNECT ] ----------------
mongoose
  .connect("mongodb://127.0.0.1:27017/wi_controller")
  .then(() => logger.success("✅ MongoDB connected"))
  .catch((err) => logger.error(`❌ MongoDB error: ${err.message}`));

// ---------------- [ EXPRESS SERVER ] ----------------
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.success(`🚀 Express server running on port ${PORT}`));

// ---------------- [ DEVICE SOCKET ] ----------------
const DEVICE_URL = "http://172.16.0.1:10001"; // replace with your device IP:port
const socket = io(DEVICE_URL, { reconnection: true });

const TARGET_EVENTS = ["updatePrimary", "cpmCalc", "systemStatus", "newCurve", "modbusData"];

socket.on("connect", () => logger.success(`✅ Connected to device at ${DEVICE_URL} | Socket ID: ${socket.id}`));
socket.on("disconnect", () => logger.warn("🔌 Disconnected from device"));
socket.on("connect_error", (err) => logger.error(`❌ Connection error: ${err.message}`));

// ---------------- [ HANDLE EVENTS ] ----------------
TARGET_EVENTS.forEach((eventName) => {
  socket.on(eventName, async (data) => {
    try {
      const deviceId = data.deviceId || "CPM-002";
      logger.info(`📡 Event received: ${eventName} | Device: ${deviceId}`);

      // Directly save incoming data
      await CPMliveService.saveRawData(deviceId, eventName, data);

      logger.success(`💾 Data saved for ${deviceId} (${eventName})`);
    } catch (err) {
      logger.error(`❌ Failed to save ${eventName}: ${err.message}`);
    }
  });
});
