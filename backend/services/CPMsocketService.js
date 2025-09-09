const { io } = require("socket.io-client");
const config = require("../utils/config");
const logger = require("../utils/logger");

const CPMliveService = require("./CPMliveService");
const CPMhistoryService = require("./CPMhistoryService");
const CPMalarmService = require("./CPMalarmService");

const SOCKET_URL = config.CPM_SOCKET_URL || "http://172.16.0.1:10001";

let socket = null;

const startCPMSocketService = () => {
  logger.info(`🔌 Connecting to Sentinel CPM via Socket.IO @ ${SOCKET_URL} ...`);

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionAttempts: Infinity,
  });

  // On connection success
  socket.on("connect", () => {
    logger.success(`✅ Connected to Sentinel CPM @ ${SOCKET_URL}`);
  });

  // On disconnect
  socket.on("disconnect", () => {
    logger.warn("⚠️ Disconnected from CPM Socket.IO, retrying...");
  });

  // On connection error
  socket.on("connect_error", (err) => {
    logger.error(`❌ CPM Socket.IO Connection Failed: ${err.message}`);
  });

  // Listen to all incoming events
  socket.onAny(async (event, data) => {
    try {
      logger.info(`📡 Event: ${event} received`);

      const deviceId = "CPM-001"; // Later we make this dynamic if multiple devices

      // Prepare structured live data
      const structuredData = prepareStructuredData(event, data, deviceId);

      // 1. Update Live Data
      if (structuredData) {
        await CPMliveService.updateLiveData(deviceId, structuredData);
      }

      // 2. Save history snapshot
      await CPMhistoryService.queueHistoryData(deviceId, structuredData);

      // 3. Check alarms
      await CPMalarmService.checkAlarms(deviceId, structuredData);

    } catch (err) {
      logger.error(`❌ Error processing CPM event: ${err.message}`);
    }
  });
};

// Helper: Convert raw socket data into structured object
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

    case "newCurve":
      structured.curveData = {
        lastUpdated: new Date(),
        CETheoretical: data.CETheoretical || [],
        CERaw: data.CERaw || [],
        CESmoothed: data.CESmoothed || [],
        HERaw: data.HERaw || [],
        HESmoothed: data.HESmoothed || [],
      };
      break;

    case "systemStatus":
      structured.status = {
        online: data.online ?? true,
        lastSeen: new Date(),
        systemStatus: data,
      };
      break;

    case "updatePrimary":
      structured.deviceInfo = {
        role: data.role || "Primary",
      };
      break;

    default:
      // Ignore unknown events for now
      return null;
  }

  return structured;
};

module.exports = { startCPMSocketService };
