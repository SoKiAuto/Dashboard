const mongoose = require("mongoose");

const CPMLiveDataSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    events: { type: mongoose.Schema.Types.Mixed, default: {} }, // store any event data
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    collection: "CPM_Live_Data",
    timestamps: true,
  }
);

module.exports = mongoose.model("CPM_Live_Data", CPMLiveDataSchema);
