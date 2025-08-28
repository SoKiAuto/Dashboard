const ModbusRTU = require("modbus-serial");

const HOST = "172.16.1.1";
const PORT = 502;
const UNIT_ID = 1;

const client = new ModbusRTU();

// Read a block of registers safely
async function readBlock(start, len, fc = 3) {
  try {
    let res;
    if (fc === 3) {
      res = await client.readHoldingRegisters(start, len);
    } else {
      res = await client.readInputRegisters(start, len);
    }

    // Filter non-zero values
    const nonZero = res.data.map((v, i) => ({ addr: start + i, val: v }))
      .filter(x => x.val !== 0);

    if (nonZero.length > 0) {
      console.log(`📌 ${fc === 3 ? "Holding" : "Input"} ${start}-${start + len - 1}:`, nonZero);
    }
  } catch (err) {
    console.error(`⚠️ Error @ ${start} (${fc === 3 ? "FC3" : "FC4"}): ${err.message}`);
  }
}

async function main() {
  try {
    await client.connectTCP(HOST, { port: PORT });
    client.setID(UNIT_ID);
    console.log(`🔌 Connected to Sentinel CPM @ ${HOST}:${PORT} (Unit ${UNIT_ID})`);

    // Scan in steps of 50 registers
    const startAddr = 42000;
    const endAddr = 44000;
    const step = 50;

    console.log("\n🚀 Starting Scan (Function Code 03 - Holding Registers)...");
    for (let i = startAddr; i <= endAddr; i += step) {
      await readBlock(i, step, 3);
    }

    console.log("\n🚀 Starting Scan (Function Code 04 - Input Registers)...");
    for (let i = startAddr; i <= endAddr; i += step) {
      await readBlock(i, step, 4);
    }

    console.log("\n✅ Scan complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection Error:", err.message);
    process.exit(1);
  }
}

main();
