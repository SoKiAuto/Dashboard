const mongoose = require("mongoose");

const ChannelConfigSchema = new mongoose.Schema({
  channel: { type: Number, required: true, unique: true },
  type: { type: String, required: true },
  unit: { type: String, required: true },
  location: { type: String }
});

module.exports = mongoose.models.ChannelConfig || mongoose.model("ChannelConfig", ChannelConfigSchema, "Sentinel-VM_channel_config");
