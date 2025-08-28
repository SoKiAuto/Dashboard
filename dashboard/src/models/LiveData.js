import mongoose from "mongoose";
const LiveDataSchema = new mongoose.Schema({}, { strict: false });
export default mongoose.models.LiveData || mongoose.model("LiveData", LiveDataSchema, "Sentinel-VM_live");
