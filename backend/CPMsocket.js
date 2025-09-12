// backend/CPMsocket.js
import { io } from "socket.io-client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Save file inside backend folder
const outputPath = path.join(__dirname, "CPMsocketdata.json");

// Device socket
const socket = io("http://172.16.0.1:10001", {
  reconnection: false, // no retries, one-shot
});

// Events we want
const TARGET_EVENTS = ["newCurve", "cpmCalc", "systemStatus", "modbusData", "updatePrimary"];

// Store results
const capturedData = {};
let pendingEvents = new Set(TARGET_EVENTS);

function saveAndExit() {
  try {
    fs.writeFileSync(outputPath, JSON.stringify(capturedData, null, 2), "utf8");
    console.log(`✅ All events captured and saved to ${outputPath}`);
  } catch (err) {
    console.error("❌ Error saving data:", err);
  } finally {
    socket.disconnect();
    console.log("🔌 Disconnected from device");
  }
}

socket.on("connect", () => {
  console.log("✅ Connected to device:", socket.id);
});

TARGET_EVENTS.forEach((event) => {
  socket.on(event, (data) => {
    if (!capturedData[event]) {
      console.log(`📡 Event received: ${event}`);
      capturedData[event] = {
        timestamp: new Date().toISOString(), // add timestamp
        data,
      };
      pendingEvents.delete(event);

      if (pendingEvents.size === 0) {
        saveAndExit();
      }
    }
  });
});

socket.on("disconnect", () => {
  console.log("🔌 Socket disconnected.");
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});
