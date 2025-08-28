// backend/tools/unlock-pvpt.js
const ModbusRTU = require("modbus-serial");

const client = new ModbusRTU();
const HOST = "172.16.1.1";
const PORT = 502;
const UNIT_ID = 1;

const UNLOCK_REGISTERS = [49990, 50000, 50001, 50010];
const UNLOCK_KEYS = [0x55aa, 0xaa55, 0xabcd, 0x1234];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function unlock() {
  try {
    await client.connectTCP(HOST, { port: PORT });
    client.setID(UNIT_ID);
    console.log(`🔌 Connected to Sentinel CPM @ ${HOST}:${PORT} (Unit ${UNIT_ID})`);

    for (const reg of UNLOCK_REGISTERS) {
      for (const key of UNLOCK_KEYS) {
        try {
          console.log(`\n🔑 Trying unlock → Register ${reg}, Key ${key.toString(16)}`);
          await client.writeRegister(reg, key);
          await sleep(500);

          // Test if PV/PT registers are now readable
          const res = await client.readHoldingRegisters(3000, 10); // 43000 - offset = 3000
          console.log(`📊 Test Read @ 43000 →`, res.data);

          if (res.data && res.data.some((v) => v !== 0)) {
            console.log(`✅ SUCCESS → PV/PT data unlocked using Register ${reg}, Key ${key.toString(16)}`);
            process.exit(0);
          }
        } catch (err) {
          console.log(`❌ Failed @ ${reg} → ${err.message}`);
        }
      }
    }

    console.log("\n⚠️ Tried all known keys — PV/PT still locked.");
    console.log("👉 Next step: Packet sniffing with Sentinel CPM official software.");

    process.exit(0);
  } catch (err) {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
  }
}

unlock();
