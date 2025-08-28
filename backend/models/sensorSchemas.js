const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema(
  {
    source: String,
    channel: String,
    timestamp: Date,
    values: mongoose.Schema.Types.Mixed,
    RPM: Number,
    quality: Number,
    config: mongoose.Schema.Types.Mixed,
  },
  { strict: false } // ✅ allow unknown fields
);

module.exports = function getSensorModel(collectionName) {
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, sensorSchema, collectionName)
  );
};
