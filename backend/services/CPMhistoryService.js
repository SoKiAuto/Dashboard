const CPMHistoryData = require("../Schema/CPM_History_Data");
const CPMHistoryConfig = require("../Schema/CPM_History_Config");
const logger = require("../utils/logger");

class CPMhistoryService {
  // Queue to temporarily store incoming data until snapshot interval
  static historyBuffer = {};
  static interval = 60 * 1000; // Default 1 min, configurable later

  /**
   * Called by CPMsocketService whenever new live data arrives
   */
  static async queueHistoryData(deviceId, structuredData) {
    try {
      if (!deviceId || !structuredData) return;

      // Store in buffer temporarily
      this.historyBuffer[deviceId] = structuredData;
    } catch (err) {
      logger.error(`❌ Error queueing history data for ${deviceId}: ${err.message}`);
    }
  }

  /**
   * Filter metrics based on CPM_History_Config
   */
  static async filterMetrics(deviceId, structuredData) {
    try {
      const config = await CPMHistoryConfig.find({ enabled: true }).lean();
      if (!config || config.length === 0) return structuredData; // If no config, store everything

      const filtered = {};
      for (const item of config) {
        const path = item.metric.split(".");
        let current = structuredData;
        let output = filtered;

        // Traverse nested objects to pick only enabled metrics
        for (let i = 0; i < path.length; i++) {
          const key = path[i];
          if (current && current.hasOwnProperty(key)) {
            current = current[key];

            if (i === path.length - 1) {
              // Last level, set value
              let temp = filtered;
              for (let j = 0; j < path.length - 1; j++) {
                if (!temp[path[j]]) temp[path[j]] = {};
                temp = temp[path[j]];
              }
              temp[key] = current;
            }
          }
        }
      }
      return filtered;
    } catch (err) {
      logger.error(`❌ Error filtering metrics for ${deviceId}: ${err.message}`);
      return structuredData; // Fallback to full data
    }
  }

  /**
   * Store history snapshot for each device
   */
  static async saveHistorySnapshot() {
    try {
      const now = new Date();
      const deviceIds = Object.keys(this.historyBuffer);

      for (const deviceId of deviceIds) {
        const structuredData = this.historyBuffer[deviceId];
        if (!structuredData) continue;

        // Filter metrics based on config
        const filteredData = await this.filterMetrics(deviceId, structuredData);

        // Create new snapshot document
        await CPMHistoryData.create({
          deviceId,
          timestamp: now,
          compressorData: filteredData.compressorData || {},
          status: filteredData.status || {},
        });

        logger.info(`📦 History snapshot saved for ${deviceId} @ ${now.toISOString()}`);
      }

      // Clear buffer after saving
      this.historyBuffer = {};
    } catch (err) {
      logger.error(`❌ Error saving history snapshot: ${err.message}`);
    }
  }

  /**
   * Start automatic history snapshot scheduler
   */
  static startScheduler(intervalMs = this.interval) {
    this.interval = intervalMs;
    setInterval(() => this.saveHistorySnapshot(), this.interval);
    logger.success(`⏳ History snapshot scheduler started (interval: ${this.interval / 1000}s)`);
  }
}

module.exports = CPMhistoryService;
