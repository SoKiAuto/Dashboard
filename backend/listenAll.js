import { io } from "socket.io-client";

const DEVICE_URL = "http://172.16.0.1:10001";
console.log("🔍 Scanning event names …");

const socket = io(DEVICE_URL, { reconnection: false });

socket.on("connect", () => {
  console.log("🔗 Connected! Listening for 6 seconds...");
});

// Track unique event names
const found = new Set();

socket.onAny((event) => {
  if (!found.has(event)) {
    found.add(event);
    console.log("📡 EVENT FOUND:", event);
  }
});

// Stop after 6 seconds
setTimeout(() => {
  console.log("\n📌 Unique Events Captured:");
  console.log([...found]);
  console.log("\n⛔ Done. Send me these event names.");
  socket.disconnect();
}, 6000);
