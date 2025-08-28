const getSensorModel = require('../models/sensorSchemas');

async function saveSensorData(reading, isHistory = false) {
  try {
    const collectionName = `${reading.source}_${isHistory ? 'history_data' : 'live_data'}`;
    const SensorModel = getSensorModel(collectionName);

    const baseDoc = {
      source: reading.source,
      channel: reading.channel,
      timestamp: reading.timestamp,
      values: reading.values,
      RPM: reading.RPM || null,
      quality: reading.quality || null,
    };

    if (reading.config) baseDoc.config = reading.config;

    if (isHistory) {
      const doc = new SensorModel(baseDoc);
      await doc.save();
    } else {
      await SensorModel.findOneAndUpdate(
        { source: reading.source, channel: reading.channel },
        baseDoc,
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error(`❌ Save failed for ${reading.source} Ch${reading.channel}:`, err.message);
  }
}

module.exports = saveSensorData;
