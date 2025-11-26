// backend/testCPMWrite.js
import { io } from "socket.io-client";
import readline from "readline";

// 🔌 CPM Device Socket
const DEVICE_URL = "http://172.16.0.1:10001";

// 🛠 Terminal Input
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// 🔐 Variables
let USERNAME = "MMS";
let PIN = "1234";
let SERIAL = "";
let TOKEN = "";
let loginRequested = false;

console.log("🔄 Connecting to CPM...");
const socket = io(DEVICE_URL, { reconnection: false });

// 📢 Request device info once connected
socket.on("connect", () => {
  console.log("🔗 Connected!");
  socket.emit("getDeviceInfo");
});

/* ---------------------------------------------------
   ⚠️ Disable heavy broadcasts immediately
--------------------------------------------------- */
const HEAVY_EVENTS = ["newCurve", "modbusData", "cpmCalc", "systemStatus"];
HEAVY_EVENTS.forEach(evt => socket.on(evt, () => {})); // ignore silently

/* ---------------------------------------------------
   📍 STEP 1: Capture Serial # only
--------------------------------------------------- */
socket.on("deviceInfo", (info) => {
  SERIAL = info?.serialNumber;
  console.log("📌 Serial:", SERIAL);
  if (!loginRequested) askLogin();
});

/* ---------------------------------------------------
   👤 Ask Username + PIN
--------------------------------------------------- */
function askLogin() {
  loginRequested = true;
  rl.question("👤 Username: ", (u) => {
    USERNAME = u.trim();
    rl.question("🔐 PIN: ", (p) => {
      PIN = p.trim();
      sendLogin();
    });
  });
}

/* ---------------------------------------------------
   🔑 Send Login
--------------------------------------------------- */
function sendLogin() {
  console.log("📤 Sending login...");
  socket.emit(
    "authenticate",
    {
      username: USERNAME,
      password: "",
      pin: PIN,
      serialNumber: SERIAL,
    },
    (res) => handleLoginResponse(res) // callback ACK
  );
}

/* ---------------------------------------------------
   📥 Login Response Handler
--------------------------------------------------- */
function handleLoginResponse(res) {
  console.log("📥 Login Response:", res);

  if (res?.error === false && res?.token) {
    TOKEN = res.token;
    console.log("🔑 Token:", TOKEN);
    setTimeout(sendDateTime, 200);
  } else {
    console.log("❌ Login Failed!");
    rl.close();
    socket.disconnect();
    process.exit();
  }
}

/* ---------------------------------------------------
   ⏱ Send Date/Time Update
--------------------------------------------------- */
function sendDateTime() {
  const payload = {
    date: "2025-11-21",
    time: "15:40:00",
    timezone: "UTC",
    token: TOKEN,
  };

  console.log("⏱ Sending Date/Time:", payload);

  socket.emit("setDate", payload, (ack) => {
    console.log("📡 Date Set Response:", ack);

    console.log("🔚 Finished. Closing...");
    rl.close();
    socket.disconnect();
    setTimeout(() => process.exit(), 300);
  });
}

/* ---------------------------------------------------
   🧹 Minimal Log (No spam)
--------------------------------------------------- */
socket.onAny((event, data) => {
  if (!HEAVY_EVENTS.includes(event) && event !== "deviceInfo" && event !== "authenticate" && event !== "setDate") {
    console.log("👉", event, data);
  }
});

/* ---------------------------------------------------
   ❌ Error + Disconnect Handling
--------------------------------------------------- */
socket.on("connect_error", (err) => console.log("❌ Connect Error:", err.message));
socket.on("disconnect", () => console.log("🔌 Disconnected"));
