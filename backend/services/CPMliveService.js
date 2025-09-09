const CPMLiveData = require("../Schema/CPM_Live_Data");
const logger = require("../utils/logger");

class CPMliveService {
  /**
   * Update live data for a device
   * @param {String} deviceId - Unique device ID (e.g. CPM-001)
   * @param {Object} structuredData - Structured data from CPMsocketService
   */
  static async updateLiveData(deviceId, structuredData) {
    try {
      if (!deviceId || !structuredData) {
        logger.warn("⚠️ Missing deviceId or structuredData in updateLiveData()");
        return;
      }

      // Build update object
      const updateData = {
        deviceId,
        deviceInfo: structuredData.deviceInfo || {},
        compressorData: structuredData.compressorData || {},
        status: structuredData.status || {},
        curveData: structuredData.curveData || {},
      };

      // Always update lastSeen and lastUpdated
      updateData.status = {
        ...updateData.status,
        lastSeen: new Date(),
      };
      updateData.deviceInfo = {
        ...updateData.deviceInfo,
        lastUpdated: new Date(),
      };

      // Upsert the live data for this device
      const result = await CPMLiveData.findOneAndUpdate(
        { deviceId },
        { $set: updateData },
        { upsert: true, new: true }
      );

      logger.success(`✅ Live data updated for device: ${deviceId}`);
      return result;
    } catch (err) {
      logger.error(`❌ Error updating live data for ${deviceId}: ${err.message}`);
    }
  }

  /**
   * Get latest live data for a device
   * @param {String} deviceId
   */
  static async getLiveData(deviceId) {
    try {
      return await CPMLiveData.findOne({ deviceId }).lean();
    } catch (err) {
      logger.error(`❌ Error fetching live data for ${deviceId}: ${err.message}`);
      return null;
    }
  }

  /**
   * Get live data for all devices
   */
  static async getAllLiveData() {
    try {
      return await CPMLiveData.find({}).lean();
    } catch (err) {
      logger.error(`❌ Error fetching all live data: ${err.message}`);
      return [];
    }
  }
}

module.exports = CPMliveService;
