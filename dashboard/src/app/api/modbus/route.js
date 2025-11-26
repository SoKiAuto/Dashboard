// dashboard/src/app/api/modbus/route.js
import ModbusRTU from "modbus-serial";
import fs from "fs";
import path from "path";

let cache = { ts: 0, data: null };
const CACHE_TTL_MS = 1000; // server will reuse cached read for 1s to avoid spamming device

function loadConfig() {
  const cfgPath = path.join(process.cwd(), "dashboard", "src", "app", "(main)", "DE4000", "modbusConfig.json");
  const raw = fs.readFileSync(cfgPath, "utf8");
  return JSON.parse(raw);
}

/**
 * Convert two 16-bit registers (array of register values) to 32-bit float with byte order.
 * registers is an array of 16-bit unsigned integers (0..65535)
 * index is the index within registers where the high/low words live (word index)
 */
function regsToFloat(registers, wordIndex, order = "ABCD") {
  // each register is 2 bytes: highByte, lowByte.
  // Build a 4-byte Buffer depending on order.
  const w0 = registers[wordIndex] ?? 0;
  const w1 = registers[wordIndex + 1] ?? 0;
  const b0 = (w0 >> 8) & 0xff;
  const b1 = w0 & 0xff;
  const b2 = (w1 >> 8) & 0xff;
  const b3 = w1 & 0xff;
  let bytes = null;
  switch (order) {
    case "ABCD": // register order w0,w1, bytes: b0 b1 b2 b3
      bytes = [b0, b1, b2, b3];
      break;
    case "BADC": // swap bytes inside words: b1 b0 b3 b2
      bytes = [b1, b0, b3, b2];
      break;
    case "CDAB": // swap words: b2 b3 b0 b1
      bytes = [b2, b3, b0, b1];
      break;
    case "DCBA": // reverse: b3 b2 b1 b0
      bytes = [b3, b2, b1, b0];
      break;
    default:
      bytes = [b0, b1, b2, b3];
  }
  const buf = Buffer.from(bytes);
  return buf.readFloatBE(0); // we constructed bytes in the correct order so use BE
}

async function readModbusOnce() {
  const cfg = loadConfig();
  const client = new ModbusRTU();
  client.setTimeout(cfg.timeout ?? 3000);

  await client.connectTCP(cfg.host, { port: cfg.port ?? 502 });
  client.setID(cfg.unitId ?? 1);

  const out = {};
  try {
    for (const block of cfg.readBlocks) {
      // read holding registers (start is 0-based)
      const res = await client.readHoldingRegisters(block.start, block.length);
      const regs = res.data; // array of 16-bit integers
      for (const [label, meta] of Object.entries(block.labels)) {
        const wordIndex = meta.offset;
        const value = regsToFloat(regs, wordIndex, cfg.floatByteOrder || "ABCD");
        out[label] = value;
      }
    }
  } finally {
    try { client.close(); } catch (e) {}
  }
  // add timestamp
  out._ts = Date.now();
  return out;
}

export async function GET() {
  // cache simple per-process
  const now = Date.now();
  if (cache.data && now - cache.ts < CACHE_TTL_MS) {
    return new Response(JSON.stringify(cache.data), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  try {
    const data = await readModbusOnce();
    cache = { ts: now, data };
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Modbus read error:", err.message || err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
