import { io } from "socket.io-client";

//////////////////////////////////////////
// 🌐 CPM DEVICE SETTINGS
//////////////////////////////////////////
const CPM_URL = "http://172.16.0.1:10001";

// 🔐 USER LOGIN DETAILS (keep same)
const USERNAME = "mms";
const PASSWORD = "";
const PIN = "l2bC7mFVHRw3AWrBzCsaPSiM8H/7fh6bfzpwMdPfwxwiTrR/Z06o8fJUg7lQRKkUSn5AJxvmq1wOdGSsR59xRw==";
const SERIAL = "E8EB1B0F60B2";

//////////////////////////////////////////
// 🕒 NEW DATE & TIME TO WRITE
//////////////////////////////////////////
const NEW_DATE = "2025-11-01";   // yyyy-mm-dd
const NEW_TIME = "16:45:00";     // hh:mm:ss
const TIMEZONE = "UTC"; // change if needed

let TOKEN = "";

// 🚀 CONNECT TO CPM
const socket = io(CPM_URL, {
  transports: ["websocket"],
  reconnection: false,
  timeout: 8000
});

console.log("🟡 Connecting to CPM...");

// 🔗 On Connect → Login
socket.on("connect", () => {
  console.log("🟢 Connected to CPM!");
  console.log("🔐 Sending Login Request...");

  socket.emit("authenticate", {
    username: USERNAME,
    password: PASSWORD,
    pin: PIN,
    serialNumber: SERIAL
  });
});

// 📥 LOGIN RESPONSE
socket.on("authenticate", (res) => {
  console.log("📥 Login Response:", res);

  if (res.error === false && res.token) {
    TOKEN = res.token;
    console.log("✅ LOGIN SUCCESS!");
    console.log("🔑 TOKEN:", TOKEN);

    // wait 200ms before sending date/time
    setTimeout(() => sendDateTime(), 200);
  } else {
    console.log("❌ LOGIN FAILED!");
    socket.disconnect();
  }
});

// ⏱ FUNCTION: SEND DATE & TIME
function sendDateTime() {
  const payload = {
    date: NEW_DATE,
    time: NEW_TIME,
    timezone: TIMEZONE,
    token: TOKEN
  };

  console.log("📤 Sending Date/Time Write:", payload);
  socket.emit("setDate", payload);
}

// 📡 RESPONSE FROM DEVICE
socket.on("setDate", (res) => {
  console.log("📡 Device Reply:", res);

  if (res?.error === false) {
    console.log("🎉 DATE/TIME UPDATED SUCCESSFULLY!");
  } else {
    console.log("⚠️ FAILED TO UPDATE DATE/TIME:", res);
  }
  socket.disconnect();
});

// 🛑 Errors & Disconnect
socket.on("connect_error", (err) => console.log("❌ Connection Error:", err.message));
socket.on("disconnect", () => console.log("🔌 Disconnected"));
