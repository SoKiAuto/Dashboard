// backend/tools/probe-pvpt-registers.js
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

const HOST = process.env.CPM_HOST || "172.16.1.1";
const PORT = Number(process.env.CPM_PORT || 502);
const UNIT_ID = Number(process.env.CPM_UNIT_ID || 1);

const START = 43000;  // beginning of suspected PV/PT data
const END = 44000;    // upper limit to test
const BLOCK_SIZE = 50; // small block size to avoid overload
const DELAY_MS = 150;

const FUNCTION_CODES = [3, 4, 23, 43]; // FC03, FC04, FC23, FC43

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testFunctionCode(fc, start, count) {
  try {
    if (fc === 3) return await client.readHoldingRegisters(start, count);
    if (fc === 4) return await client.readInputRegisters(start, count);
    if (fc === 23) {
      // Read/Write Multiple Registers — Read only part
      return await client.readHoldingRegisters(start, count);
    }
    if (fc === 43) {
      // Device Identification — usually doesn't support block reads
      return await client.readHoldingRegisters(start, count);
    }
    return null;
  } catch (err) {
    return { error: err.message };
  }
}

async function probeRegisters() {
  await client.connectTCP(HOST, { port: PORT });
  client.setID(UNIT_ID);
  console.log(`🔌 Connected to Sentinel CPM @ ${HOST}:${PORT} (Unit ${UNIT_ID})`);

  console.log(
    `\n🚀 Starting probe: ${START} → ${END} (block=${BLOCK_SIZE})`
  );

  for (let fc of FUNCTION_CODES) {
    console.log(`\n=== Testing Function Code FC${fc} ===`);
    for (let addr = START; addr <= END; addr += BLOCK_SIZE) {
      const res = await testFunctionCode(fc, addr, BLOCK_SIZE);

      if (res?.error) {
        console.log(
          `❌ FC${fc} failed @ ${addr}..${addr + BLOCK_SIZE - 1} → ${res.error}`
        );
      } else if (res?.data) {
        const preview = res.data.slice(0, 6).join(", ");
        console.log(
          `✅ FC${fc} OK @ ${addr}..${addr + BLOCK_SIZE - 1} → [${preview}...]`
        );
      } else {
        console.log(
          `⚠️ FC${fc} returned unknown response @ ${addr}..${addr + BLOCK_SIZE - 1}`
        );
      }
      await sleep(DELAY_MS);
    }
  }

  console.log("\n✅ Probe complete!");
  process.exit(0);
}

probeRegisters().catch((err) => {
  console.error("Fatal probe error:", err);
  process.exit(1);
});
