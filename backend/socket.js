const fs = require("fs");
const path = require("path");
const { io } = require("socket.io-client");

const DATA_FILE = path.join(__dirname, "socketdata.json");

// Function to safely write JSON
const saveJSON = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Data saved to ${DATA_FILE}`);
};

// Connect to Sentinel-CPM WebSocket
const socket = io("http://172.16.0.1:10001", {
  transports: ["websocket", "polling"],
});

console.log("⏳ Connecting to Sentinel-CPM WebSocket...");

let collectedData = {};
let receivedEvents = new Set();
const REQUIRED_EVENTS = ["updatePrimary", "newCurve", "cpmCalc", "modbusData", "systemStatus"];

// On successful connection
socket.on("connect", () => {
  console.log("✅ Connected to CPM WebSocket");
});

// Listen for incoming events
socket.onAny((event, data) => {
  console.log(`📡 Event received: ${event}`);

  // Save event data
  collectedData[event] = data;
  receivedEvents.add(event);

  // Check if we received all important events
  const allReceived = REQUIRED_EVENTS.every((e) => receivedEvents.has(e));

  if (allReceived) {
    console.log("✅ All required data received, saving and disconnecting...");
    saveJSON(collectedData);
    socket.disconnect();
    process.exit(0);
  }
});

// Handle disconnection
socket.on("disconnect", () => {
  console.log("❌ Disconnected from CPM WebSocket");
});

// Handle errors
socket.on("connect_error", (error) => {
  console.error("⚠️ Connection Error:", error.message);
});
