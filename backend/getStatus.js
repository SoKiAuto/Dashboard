import { io } from "socket.io-client";

const DEVICE_URL = "http://172.16.0.1:10001";

console.log("🔌 Connecting to CPM...");

const socket = io(DEVICE_URL, { reconnection: false });

socket.on("connect", () => {
  console.log("🔗 Connected!");
  console.log("📡 Requesting Status...");
  socket.emit("getSystemStatus"); // 💡 Some CPMs require request
});

// Listen for status
socket.on("systemStatus", (data) => {
  console.log("📥 System Status:", data);
  console.log("\n⏱ Time:", data?.time);
  console.log("🌍 Timezone:", data?.timezone);
  // 👉 serial not provided here
  console.log("🔍 Serial may not be accessible until Auth!");
  socket.disconnect();
});

// Check if event names visible
socket.onAny((evt, data) => {
  if (evt !== "systemStatus" && evt !== "connect" && evt !== "disconnect")
    console.log("🔎 Event:", evt);
});

socket.on("connect_error", err => console.log("❌ Connection Error:", err.message));
socket.on("disconnect", () => console.log("🔌 Disconnected"));
