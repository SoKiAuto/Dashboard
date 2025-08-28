const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

const HOST = process.env.CPM_HOST || "172.16.1.1";
const PORT = Number(process.env.CPM_PORT || 502);
const UNIT_ID = Number(process.env.CPM_UNIT_ID || 1);

const START = 42000;
const END = 45000;
const BLOCK = 10;
const DELAY_MS = 50;

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function probeHiddenRegisters() {
  try {
    await client.connectTCP(HOST, { port: PORT });
    client.setID(UNIT_ID);
    console.log(`🔌 Connected to Sentinel CPM @ ${HOST}:${PORT} (Unit ${UNIT_ID})`);
    console.log(`🚀 Probing registers ${START} → ${END} (step ${BLOCK})`);

    for (let addr = START; addr <= END; addr += BLOCK) {
      try {
        const res = await client.readHoldingRegisters(addr, BLOCK);
        console.log(`✅ Readable @ ${addr} → Data:`, res.data);
      } catch (err) {
        if (!err.message.includes("Illegal data address")) {
          console.warn(`⚠️ Unexpected failure @ ${addr}: ${err.message}`);
        }
      }
      await delay(DELAY_MS);
    }
    console.log("🎯 Probe completed!");
  } catch (err) {
    console.error("❌ Connection error:", err.message);
  } finally {
    client.close();
  }
}

probeHiddenRegisters();
