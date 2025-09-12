// testSocket.js
const { io } = require("socket.io-client");

// Replace with your device IP and port
const DEVICE_URL = "http://172.16.0.1:10001";

const socket = io(DEVICE_URL, {
  reconnection: true,
  transports: ["websocket"], // optional, forces websocket
});

// List of events we want to test
const TARGET_EVENTS = ["updatePrimary", "cpmCalc", "systemStatus", "newCurve", "modbusData"];

// Connection status
socket.on("connect", () => {
  console.log(`✅ Connected to device at ${DEVICE_URL} | Socket ID: ${socket.id}`);
});

socket.on("disconnect", () => {
  console.log("🔌 Disconnected from device");
});

socket.on("connect_error", (err) => {
  console.log(`❌ Connection error: ${err.message}`);
});

// Log all incoming events
TARGET_EVENTS.forEach((eventName) => {
  socket.on(eventName, (data) => {
    console.log("\n----------------------------------------");
    console.log(`📡 Event received: ${eventName}`);
    console.log("Raw data received from socket:");
    console.dir(data, { depth: null, colors: true });
    console.log("----------------------------------------\n");
  });
});
