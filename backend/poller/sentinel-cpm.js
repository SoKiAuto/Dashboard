const ModbusRTU = require("modbus-serial");
const connectDB = require("../db/mongo");
const saveReading = require("../services/insertData");
const { decodeCPM } = require("../services/cpmDecode");
const cpmAlarmCheck = require("../services/cpmAlarmCheck");

const client = new ModbusRTU();

const HOST = process.env.CPM_HOST || "172.16.1.1";
const PORT = Number(process.env.CPM_PORT || 502);
const UNIT_ID = Number(process.env.CPM_UNIT_ID || 1);
const POLL_INTERVAL = Number(process.env.CPM_POLL_INTERVAL || 2000);
const HISTORY_INTERVAL = Number(process.env.CPM_HISTORY_INTERVAL || 6000);

const READ_BLOCKS = [
  { start: 0, len: 100 },
  { start: 100, len: 100 },
  { start: 200, len: 100 },
];

let lastHistoryTime = Date.now();
let isConnected = false;
let pollingTimer = null;

async function connectCPM() {
  try {
    await client.connectTCP(HOST, { port: PORT });
    client.setID(UNIT_ID);
    isConnected = true;
    console.log(`🔌 Connected to Sentinel-CPM @ ${HOST}:${PORT} (Unit ${UNIT_ID})`);

    // Reset alarms if communication restored
    await cpmAlarmCheck({ commBreak: false });
  } catch (err) {
    isConnected = false;
    console.error(`❌ Modbus TCP connection failed (CPM): ${err.message}`);

    try {
      await cpmAlarmCheck({ commBreak: true });
    } catch (alarmErr) {
      console.error("⚠️ Communication Break Alarm failed:", alarmErr.message);
    }

    // Retry after 5 seconds
    setTimeout(connectCPM, 5000);
  }
}

async function pollSentinelCPM() {
  await connectDB();
  await connectCPM();

  pollingTimer = setInterval(async () => {
    if (!isConnected) return; // Skip polling if disconnected

    const now = Date.now();
    const isHistory = now - lastHistoryTime >= HISTORY_INTERVAL;
    const timestamp = new Date();

    try {
      // Read Modbus registers
      const raw = [];
      for (const blk of READ_BLOCKS) {
        const res = await client.readHoldingRegisters(blk.start, blk.len);
        raw.push(...res.data);
      }

      // Decode CPM data
      const grouped = decodeCPM(raw);

      if (grouped) {
        const structDoc = {
          source: "Sentinel-CPM",
          channel: "STRUCT",
          timestamp,
          values: grouped,
          quality: 192,
        };

        await saveReading(structDoc, isHistory);

        if (!isHistory) {
          try {
            await cpmAlarmCheck({ values: grouped });
          } catch (err) {
            console.error("❌ CPM Alarm check failed:", err.message);
          }
        }

        if (isHistory) lastHistoryTime = now;
      } else {
        console.warn("⚠️ [CPM] No data decoded, skipping MongoDB insert.");
      }
    } catch (err) {
      console.error("❌ Polling error (CPM):", err.message);

      if (
        err.message.includes("Port Not Open") ||
        err.message.includes("Timed out") ||
        err.message.includes("ETIMEDOUT")
      ) {
        // Close client before reconnecting
        try {
          client.close(() => console.log("⚠️ CPM client closed."));
        } catch {}
        isConnected = false;

        console.warn("⚠️ CPM client disconnected — retrying in 5 sec...");
        setTimeout(connectCPM, 5000);
      }
    }
  }, POLL_INTERVAL);
}

module.exports = pollSentinelCPM;
