import { io } from "socket.io-client";

//////////////////////////////////////////
// 🌐 CURRENT CPM DEVICE SETTINGS
//////////////////////////////////////////
let CPM_URL = "http://172.16.0.1:10001"; // current IP
const USERNAME = "mms";
const PASSWORD = "";
const PIN = "l2bC7mFVHRw3AWrBzCsaPSiM8H/7fh6bfzpwMdPfwxwiTrR/Z06o8fJUg7lQRKkUSn5AJxvmq1wOdGSsR59xRw==";
const SERIAL = "E8EB1B0F60B2";

//////////////////////////////////////////
// 🌐 NEW IP SETTINGS
//////////////////////////////////////////
const NEW_IP = "172.16.0.1/24"; // must include /24 like the device expects
const GATEWAY = "172.16.0.1";    // can be empty string ""
const WEB_PORT = 10001;
const DNS = "8.8.8.8"; // optional

let TOKEN = "";

// 🚀 CONNECT TO CPM
const socket = io(CPM_URL, {
  transports: ["websocket"],
  reconnection: false,
  timeout: 8000
});

console.log("🟡 Connecting to CPM...");

// 🔗 On Connect → Authenticate
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

    // wait a bit before sending IP change
    setTimeout(() => sendIP(), 200);
  } else {
    console.log("❌ LOGIN FAILED!");
    socket.disconnect();
  }
});

// ⏱ FUNCTION: SEND IP CHANGE
function sendIP() {
  const payload = {
    token: TOKEN,
    ip: NEW_IP,
    gateway: GATEWAY,
    webServerPort: WEB_PORT,
    dns: DNS
  };

  console.log("📤 Sending IP Change Request:", payload);
  socket.emit("setEthernet", payload);

  console.log("⚠️ NOTE: Device will disconnect immediately after changing IP.");
}

// 🛑 HANDLE DISCONNECT
socket.on("disconnect", (reason) => {
  console.log("🔌 Disconnected from device. This is expected after IP change.");
  console.log(`💡 Now try reconnecting using new IP: http://${NEW_IP.split("/")[0]}:${WEB_PORT}`);
});

// 🛑 HANDLE ERRORS
socket.on("connect_error", (err) => console.log("❌ Connection Error:", err.message));
