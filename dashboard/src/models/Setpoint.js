import mongoose from "mongoose";
const SetpointSchema = new mongoose.Schema({}, { strict: false });
export default mongoose.models.Setpoint || mongoose.model("Setpoint", SetpointSchema, "Sentinel-VM_setpoints");
