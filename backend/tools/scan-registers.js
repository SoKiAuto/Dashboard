// backend/tools/scan-registers.js
/**
 * Scan Sentinel-CPM Modbus register exposure.
 * - FC03 (Holding) -> 0-based addr maps to 40001+addr
 * - FC04 (Input)   -> 0-based addr maps to 30001+addr
 *
 * ENV:
 *  CPM_HOST=172.16.1.1
 *  CPM_PORT=502
 *  CPM_UNIT_ID=1
 *  SCAN_MAX=50000         // max 0-based index to try
 *  SCAN_BLOCK=100         // block size per read (<=125 recommended)
 *  SCAN_DELAY_MS=30       // delay between reads to avoid flooding
 *  FAIL_STOP=6            // stop after N consecutive failures (per FC)
 */

const ModbusRTU = require("modbus-serial");

const HOST = process.env.CPM_HOST || "172.16.1.1";
const PORT = Number(process.env.CPM_PORT || 502);
const UNIT_ID = Number(process.env.CPM_UNIT_ID || 1);
const SCAN_MAX = Number(process.env.SCAN_MAX || 50000);
const BLOCK = Number(process.env.SCAN_BLOCK || 100);
const DELAY_MS = Number(process.env.SCAN_DELAY_MS || 30);
const FAIL_STOP = Number(process.env.FAIL_STOP || 6);

const client = new ModbusRTU();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function connect() {
  await client.connectTCP(HOST, { port: PORT });
  client.setID(UNIT_ID);
  console.log(`🔌 Connected to Sentinel CPM @ ${HOST}:${PORT} (Unit ${UNIT_ID})`);
}

function mergeRanges(blocks) {
  if (!blocks.length) return [];
  const sorted = blocks
    .map(b => ({ start: b.start, end: b.start + b.len - 1 }))
    .sort((a, b) => a.start - b.start);

  const merged = [];
  let cur = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    const r = sorted[i];
    if (r.start <= cur.end + 1) {
      // contiguous or touching
      cur.end = Math.max(cur.end, r.end);
    } else {
      merged.push(cur);
      cur = { ...r };
    }
  }
  merged.push(cur);
  return merged;
}

function fmtRange0(r) {
  return `${r.start}..${r.end} (count=${r.end - r.start + 1})`;
}
function fmtRange4xxxx(r) {
  return `${r.start + 40001}..${r.end + 40001}`;
}
function fmtRange3xxxx(r) {
  return `${r.start + 30001}..${r.end + 30001}`;
}

async function scanFC03() {
  console.log("\n--- Scanning FC=03 (Holding Registers) ---");
  const successBlocks = [];
  let fails = 0;

  for (let addr = 0; addr <= SCAN_MAX; addr += BLOCK) {
    try {
      const res = await client.readHoldingRegisters(addr, BLOCK);
      if (res && Array.isArray(res.data)) {
        successBlocks.push({ start: addr, len: BLOCK });
        fails = 0;
        // Print a heartbeat every ~1000 addresses
        if ((addr / BLOCK) % Math.ceil(1000 / BLOCK) === 0) {
          console.log(`✅ FC03 ok at ${addr}..${addr + BLOCK - 1}`);
        }
      } else {
        fails++;
        console.log(`⚠️  FC03 empty at ${addr}..${addr + BLOCK - 1}`);
      }
    } catch (e) {
      fails++;
      const msg = (e && e.message) || String(e);
      console.log(`❌ FC03 fail at ${addr}..${addr + BLOCK - 1}: ${msg}`);
      if (fails >= FAIL_STOP) {
        console.log(`⛔ FC03 stopping after ${FAIL_STOP} consecutive failures.`);
        break;
      }
    }
    await sleep(DELAY_MS);
  }

  const ranges = mergeRanges(successBlocks);
  if (!ranges.length) {
    console.log("⚠️  FC03: No readable ranges detected.");
    return [];
  }

  console.log("\n📊 FC03 (Holding) — Readable Ranges:");
  ranges.forEach((r, i) => {
    console.log(
      `  [${i + 1}] 0-based: ${fmtRange0(r)}  |  4xxxx-style: ${fmtRange4xxxx(r)}`
    );
  });

  const total = ranges.reduce((acc, r) => acc + (r.end - r.start + 1), 0);
  console.log(`➡️  FC03 total readable registers: ${total}\n`);
  return ranges;
}

async function scanFC04() {
  console.log("\n--- Scanning FC=04 (Input Registers) ---");
  const successBlocks = [];
  let fails = 0;

  for (let addr = 0; addr <= SCAN_MAX; addr += BLOCK) {
    try {
      const res = await client.readInputRegisters(addr, BLOCK);
      if (res && Array.isArray(res.data)) {
        successBlocks.push({ start: addr, len: BLOCK });
        fails = 0;
        if ((addr / BLOCK) % Math.ceil(1000 / BLOCK) === 0) {
          console.log(`✅ FC04 ok at ${addr}..${addr + BLOCK - 1}`);
        }
      } else {
        fails++;
        console.log(`⚠️  FC04 empty at ${addr}..${addr + BLOCK - 1}`);
      }
    } catch (e) {
      fails++;
      const msg = (e && e.message) || String(e);
      console.log(`❌ FC04 fail at ${addr}..${addr + BLOCK - 1}: ${msg}`);
      if (fails >= FAIL_STOP) {
        console.log(`⛔ FC04 stopping after ${FAIL_STOP} consecutive failures.`);
        break;
      }
    }
    await sleep(DELAY_MS);
  }

  const ranges = mergeRanges(successBlocks);
  if (!ranges.length) {
    console.log("⚠️  FC04: No readable ranges detected.");
    return [];
  }

  console.log("\n📊 FC04 (Input) — Readable Ranges:");
  ranges.forEach((r, i) => {
    console.log(
      `  [${i + 1}] 0-based: ${fmtRange0(r)}  |  3xxxx-style: ${fmtRange3xxxx(r)}`
    );
  });

  const total = ranges.reduce((acc, r) => acc + (r.end - r.start + 1), 0);
  console.log(`➡️  FC04 total readable registers: ${total}\n`);
  return ranges;
}

(async () => {
  try {
    await connect();

    console.log("\n🚀 Starting scan with params:", {
      HOST, PORT, UNIT_ID, SCAN_MAX, BLOCK, DELAY_MS, FAIL_STOP,
    });

    const r03 = await scanFC03();
    const r04 = await scanFC04();

    // Quick summary
    console.log("\n================ SUMMARY ================\n");
    if (r03.length) {
      const last = r03[r03.length - 1];
      console.log(`FC03 max end (0-based): ${last.end}  |  4xxxx max: ${last.end + 40001}`);
    } else {
      console.log("FC03: No readable ranges.");
    }
    if (r04.length) {
      const last = r04[r04.length - 1];
      console.log(`FC04 max end (0-based): ${last.end}  |  3xxxx max: ${last.end + 30001}`);
    } else {
      console.log("FC04: No readable ranges.");
    }
    console.log("\n✅ Scan complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Scanner error:", err);
    process.exit(1);
  }
})();
