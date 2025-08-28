// backend/tools/device-info.js
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

// Sentinel CPM connection
const HOST = process.env.CPM_HOST || "172.16.1.1";
const PORT = Number(process.env.CPM_PORT || 502);
const UNIT_ID = Number(process.env.CPM_UNIT_ID || 1);

async function readDeviceInfo() {
  try {
    await client.connectTCP(HOST, { port: PORT });
    client.setID(UNIT_ID);
    console.log(`🔌 Connected to Sentinel CPM @ ${HOST}:${PORT} (Unit ${UNIT_ID})`);

    console.log("📡 Requesting device identification via Modbus FC43...");

    // Function Code 43 / MEI Type 14 → Read Device Identification
    const response = await client.writeFC43({
      meiType: 0x0e,     // MEI Type for device info
      readDeviceIdCode: 0x01, // Basic device identification
      objectId: 0x00     // Start from first object
    });

    console.log("✅ Device Identification Data:");
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("❌ FC43 request failed:", err.message);
  } finally {
    client.close();
  }
}

readDeviceInfo();
