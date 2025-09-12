const CPMLiveData = require("../Schema/CPM_Live_Data");
const logger = require("../utils/logger");

class CPMliveService {
  // Save all incoming data directly under the event name
  static async saveRawData(deviceId, eventName, data) {
    try {
      if (!deviceId || !data) return;

      const updateObj = {
        deviceId,
        [`events.${eventName}`]: data,
        lastUpdated: new Date(),
      };

      const result = await CPMLiveData.findOneAndUpdate(
        { deviceId },
        { $set: updateObj },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return result;
    } catch (err) {
      logger.error(`❌ Error saving raw data for ${deviceId}: ${err.message}`);
      throw err;
    }
  }

  static async getLiveData(deviceId) {
    return await CPMLiveData.findOne({ deviceId }).lean();
  }
}

module.exports = CPMliveService;
