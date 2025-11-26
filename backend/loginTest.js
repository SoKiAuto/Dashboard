import { io } from "socket.io-client";


// CPM WebSocket URL  (change if different)
const socket = io("ws://172.16.0.1:10001", {
  transports: ["websocket"]
});

// Your correct login payload from browser
const loginPayload = {
  username: "mms",
  password: "",
  pin: "l2bC7mFVHRw3AWrBzCsaPSiM8H/7fh6bfzpwMdPfwxwiTrR/Z06o8fJUg7lQRKkUSn5AJxvmq1wOdGSsR59xRw==",
  serialNumber: "E8EB1B0F60B2"
};

socket.on("connect", () => {
  console.log("🟢 Connected to CPM!");
  console.log("🔐 Sending Login Request...");
  socket.emit("authenticate", loginPayload);
});

// Listen for login response
socket.on("authenticate", (data) => {
  console.log("📥 Login Response:", data);

  if (data.error === false) {
    console.log("✅ LOGIN SUCCESS!");
    console.log("🔑 TOKEN:", data.token);
  } else {
    console.log("❌ LOGIN FAILED!");
  }
});

// Errors
socket.on("connect_error", (err) => {
  console.log("❌ Connection Error:", err.message);
});
