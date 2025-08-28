import mongoose from "mongoose";
const AlarmSchema = new mongoose.Schema({
  channel: Number,
  metric: String,
  value: Number,
  threshold: Number,
  type: String,
  message: String,
  timestamp: Date,
});
export default mongoose.models.Alarm || mongoose.model("Alarm", AlarmSchema, "Sentinel-VM_alarms");
