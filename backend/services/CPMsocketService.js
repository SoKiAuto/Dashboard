const { io } = require("socket.io-client");
const config = require("../utils/config");
const logger = require("../utils/logger");

const CPMliveService = require("./CPMliveService");
const CPMhistoryService = require("./CPMhistoryService");
const CPMalarmService = require("./CPMalarmService");

const SOCKET_URL = config.CPM_SOCKET_URL || "http://172.16.0.1:10001";
const POLL_INTERVAL = config.LIVE_POLL_INTERVAL || 5000; // every 5 seconds

let socket = null;
let latestSnapshot = {}; // store latest metrics

const startCPMSocketService = () => {
  logger.info(`🔌 Connecting to Sentinel CPM via Socket.IO @ ${SOCKET_URL} ...`);

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionAttempts: Infinity,
  });

  socket.on("connect", () => {
    logger.success(`✅ Connected to Sentinel CPM @ ${SOCKET_URL}`);
  });

  socket.on("disconnect", () => {
    logger.warn("⚠️ Disconnected from CPM Socket.IO, retrying...");
  });

  socket.on("connect_error", (err) => {
    logger.error(`❌ CPM Socket.IO Connection Failed: ${err.message}`);
  });

  // Handle all incoming socket events
  socket.onAny(async (event, data) => {
    try {
      logger.info(`📡 Event: ${event} received`);

      const deviceId = data?.deviceId || data?.serialNo || "CPM-001";
      const structuredData = prepareStructuredData(event, data, deviceId);

      if (!structuredData) return;

      // Save the latest snapshot for continuous polling
      latestSnapshot[deviceId] = {
        ...(latestSnapshot[deviceId] || {}),
        ...structuredData,
      };

      // Update live data immediately
      await CPMliveService.updateLiveData(deviceId, structuredData);

      // Store historical snapshot if enabled
      await CPMhistoryService.queueHistoryData(deviceId, structuredData);

      // Check alarms based on thresholds
      await CPMalarmService.checkAlarms(deviceId, structuredData);
    } catch (err) {
      logger.error(`❌ Error processing CPM event: ${err.message}`);
    }
  });

  // Start continuous polling every 5 seconds
  setInterval(async () => {
    try {
      const deviceId = "CPM-001";
      const snapshot = latestSnapshot[deviceId];

      if (snapshot) {
        await CPMliveService.updateLiveData(deviceId, snapshot);
        logger.info(`🔄 Continuous live data refreshed for ${deviceId}`);
      }
    } catch (err) {
      logger.error(`❌ Error in continuous polling: ${err.message}`);
    }
  }, POLL_INTERVAL);
};

// Helper: Prepare structured data from raw socket events
const prepareStructuredData = (event, data, deviceId) => {
  const structured = { deviceId };

  switch (event) {
    case "cpmCalc":
      structured.compressorData = {
        unit: data.unit || {},
        stages: data.stage || [],
        cylinders: data.cylinder || [],
      };
      break;

    case "modbusData":
      structured.compressorData = {
        ...(structured.compressorData || {}),
        registers: data.registers || [],
      };
      break;

      
case "newCurve":
  console.log("🎯 NEW CURVE RAW DATA:", data);

  // Always ensure cylinders array
  const cylinders = Array.isArray(data) ? data : [data];

  structured.curveData = {
    lastUpdated: new Date(),
    cylinders: cylinders.map((cylinder) => ({
      CERaw: cylinder?.CERaw || [],
      CESmoothed: cylinder?.CESmoothed || [],
      CETheoretical: cylinder?.CETheoretical || [],
      HERaw: cylinder?.HERaw || [],
      HESmoothed: cylinder?.HESmoothed || [],
      HETheoretical: cylinder?.HETheoretical || [],
    })),
  };
  break;



    case "systemStatus":
      structured.status = {
        online: true,
        lastSeen: new Date(),
        systemStatus: data,
      };
      break;

    case "updatePrimary":
      structured.deviceInfo = {
        role: data.role || "Primary",
        name: data.deviceName || "CPM Device",
        serialNumber: data.serialNo || null,
        ipAddress: data.ip || SOCKET_URL,
      };
      break;

    default:
      return null;
  }

  return structured;
};

module.exports = { startCPMSocketService };
