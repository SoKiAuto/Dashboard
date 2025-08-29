const ModbusRTU = require("modbus-serial");
const connectDB = require("../db/mongo");
const saveReading = require("../services/insertData");
const checkAlarms = require("../services/alarmCheck");
const ChannelConfig = require("../models/channelConfig");

const client = new ModbusRTU();
const HOST = process.env.VM_HOST || "192.168.7.2";
const PORT = Number(process.env.VM_PORT || 502);
const POLL_INTERVAL = Number(process.env.VM_POLL_INTERVAL || 2000);
const HISTORY_INTERVAL = Number(process.env.VM_HISTORY_INTERVAL || 40000);

async function pollSentinelVM() {
  await connectDB();

  // Load channel configs from MongoDB
  const configs = await ChannelConfig.find({});
  const channelMap = {};
  configs.forEach(cfg => {
    channelMap[cfg.channel] = cfg;
  });

  async function connectVM() {
    try {
      await client.connectTCP(HOST, { port: PORT });
      console.log(`🔌 Connected to Sentinel-VM @ ${HOST}:${PORT}`);
    } catch (err) {
      console.error("❌ Modbus TCP connection failed (VM):", err.message);
      setTimeout(connectVM, 5000); // Retry after 5 seconds
    }
  }

  await connectVM();

  let lastHistoryTime = Date.now();

  setInterval(async () => {
    const now = Date.now();
    const isHistory = now - lastHistoryTime >= HISTORY_INTERVAL;
    const timestamp = new Date();

    try {
      const data = await client.readHoldingRegisters(0, 90);
      const valuesRaw = data.data;

      const saveTasks = [];

      // Process channels 1 to 12
      for (let i = 0; i < 12; i++) {
        const ch = i + 1;
        const cfg = channelMap[ch] || {};

        const values = {
          Overall_RMS: parseFloat(((valuesRaw[0 + i] || 0) / 10).toFixed(2)),
          Waveform_RMS: parseFloat(((valuesRaw[12 + i] || 0) / 10).toFixed(2)),
          FFT_RMS: parseFloat(((valuesRaw[24 + i] || 0) / 10).toFixed(2)),
        };

        if (ch <= 8) {
          values.Bias_Voltage = parseFloat(
            ((valuesRaw[36 + i] || 0) / 100).toFixed(2)
          );
        }

        if (ch >= 9) {
          values.RodDrop_RMS = parseFloat(
            ((valuesRaw[48 + i] || 0) / 10).toFixed(2)
          );
          values.RodDrop_PkPk = parseFloat(
            ((valuesRaw[60 + i] || 0) / 10).toFixed(2)
          );
          values.RodDrop_Min = parseFloat(
            ((valuesRaw[72 + i] || 0) / 10).toFixed(2)
          );
          values.RodDrop_Max = parseFloat(
            ((valuesRaw[84 + i] || 0) / 10).toFixed(2)
          );
        }

        const reading = {
          source: "Sentinel-VM",
          channel: ch,
          timestamp,
          values,
          quality: 192,
          config: {
            type: cfg.type || null,
            unit: cfg.unit || null,
            multiplier: cfg.multiplier ?? 1,
            location: cfg.location || null,
          },
        };

        saveTasks.push(
          (async () => {
            await saveReading(reading, isHistory);
            if (!isHistory) await checkAlarms(reading);
          })()
        );
      }

      // Save RPM separately
      const rpmReading = {
        source: "Sentinel-VM",
        channel: "RPM",
        timestamp,
        values: { RPM: valuesRaw[89] || 0 },
        quality: 192,
      };

      saveTasks.push(
        (async () => {
          await saveReading(rpmReading, isHistory);
        })()
      );

      await Promise.all(saveTasks);

      if (isHistory) lastHistoryTime = now;
    } catch (err) {
      console.error("❌ Polling error (VM):", err.message);

      if (
        err.message.includes("Port Not Open") ||
        err.message.includes("ECONNRESET") ||
        err.message.includes("ETIMEDOUT")
      ) {
        console.warn("⚠️ Reconnecting Sentinel-VM...");
        try {
          await client.close();
        } catch {}
        await connectVM();
      }
    }
  }, POLL_INTERVAL);
}

module.exports = pollSentinelVM;
