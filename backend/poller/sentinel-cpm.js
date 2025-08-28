const ModbusRTU = require("modbus-serial");
const connectDB = require("../db/mongo");
const saveReading = require("../services/insertData");
const { decodeCPM } = require("../services/cpmDecode");
const cpmAlarmCheck = require("../services/cpmAlarmCheck"); // ✅ CPM alarms

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

async function pollSentinelCPM() {
  await connectDB();

  try {
    await client.connectTCP(HOST, { port: PORT });
    client.setID(UNIT_ID);
    console.log(
      `🔌 Connected to Sentinel-CPM @ ${HOST}:${PORT} (Unit ${UNIT_ID})`
    );
  } catch (err) {
    console.error("❌ Modbus TCP connection failed (CPM):", err.message);

    try {
      await cpmAlarmCheck({ commBreak: true });
    } catch (alarmErr) {
      console.error("⚠️ Communication Break Alarm failed:", alarmErr.message);
    }
    return;
  }

  let lastHistoryTime = Date.now();

  setInterval(async () => {
    const now = Date.now();
    const isHistory = now - lastHistoryTime >= HISTORY_INTERVAL;
    const timestamp = new Date();

    try {
      // Read register blocks
      const raw = [];
      for (const blk of READ_BLOCKS) {
        const res = await client.readHoldingRegisters(blk.start, blk.len);
        raw.push(...res.data);
      }

      // Decode CPM hierarchical structured object
      const grouped = decodeCPM(raw);

      if (grouped) {
        const structDoc = {
          source: "Sentinel-CPM",
          channel: "STRUCT",
          timestamp,
          values: grouped,
          quality: 192,
        };

        // ✅ Save structured document only
        await saveReading(structDoc, isHistory);

        // ✅ Trigger alarm check only for LIVE readings
        if (!isHistory) {
          try {
            await cpmAlarmCheck({ values: grouped });
          } catch (err) {
            console.error("❌ CPM Alarm check failed:", err.message);
          }
        }

        // 🟢 Commented unnecessary logs to avoid flooding
        // if (isHistory) {
        //   console.log("🕓 [CPM] Saved history data");
        //   lastHistoryTime = now;
        // } else {
        //   console.log("⚡ [CPM] Saved live data & checked alarms");
        // }
        if (isHistory) lastHistoryTime = now;

      } else {
        console.warn("⚠️ [CPM] No data decoded, skipping MongoDB insert.");
      }
    } catch (err) {
      console.error("❌ Polling error (CPM):", err.message);

      try {
        await cpmAlarmCheck({ commBreak: true });
      } catch (alarmErr) {
        console.error("⚠️ Communication Break Alarm failed:", alarmErr.message);
      }
    }
  }, POLL_INTERVAL);
}

module.exports = pollSentinelCPM;
