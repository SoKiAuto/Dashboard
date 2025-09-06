const fs = require("fs");
const path = require("path");
const { io } = require("socket.io-client");

// Path to snapshot file
const DATA_FILE = path.join(__dirname, "socketdata.json");

// Load old snapshot
let oldData = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    oldData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    console.log("📄 Loaded existing snapshot.");
  } catch (err) {
    console.error("❌ Error reading snapshot:", err);
  }
} else {
  console.warn("⚠️ No snapshot file found, starting fresh.");
}

// Connect to CPM WebSocket
const socket = io("http://172.16.0.1:10001", {
  transports: ["websocket", "polling"],
});

console.log("⏳ Connecting to Sentinel-CPM WebSocket...");

socket.on("connect", () => {
  console.log("✅ Connected to CPM WebSocket");
});

// Keys to ignore when comparing
const IGNORE_KEYS = ["time", "timestamp", "lastUploadSuccess", "lastUploadFail"];

// Deep comparison ignoring timestamps
function deepDiff(obj1, obj2, path = "") {
  let changes = [];

  // If value is primitive
  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    const keyName = path.split(".").pop();
    if (!IGNORE_KEYS.includes(keyName) && obj1 !== obj2) {
      changes.push(`${path}: ${obj1} → ${obj2}`);
    }
    return changes;
  }

  // Compare nested objects
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
  for (const key of allKeys) {
    const newPath = path ? `${path}.${key}` : key;
    changes = changes.concat(deepDiff(obj1?.[key], obj2?.[key], newPath));
  }

  return changes;
}

// Listen for events
socket.onAny((event, data) => {
  const oldSection = oldData[event] || {};
  const changes = deepDiff(oldSection, data);

  if (changes.length > 0) {
    console.log(`📡 Event: ${event} → Changes detected:`);
    changes.forEach(c => console.log("   " + c));
  }

  // Update snapshot in memory
  oldData[event] = data;
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from CPM WebSocket");
});

socket.on("connect_error", (error) => {
  console.error("⚠️ WebSocket Connection Error:", error.message);
});
