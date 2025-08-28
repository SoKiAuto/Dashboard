const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  source: String,
  timestamp: { type: Date, default: Date.now },
  RPM: Number,
  quality: Number
});

const MachineStatus = mongoose.model('Sentinel-VM_machine_status', schema, 'Sentinel-VM_machine_status');

async function saveMachineStatus(status) {
  try {
    await MachineStatus.findOneAndUpdate(
      { source: status.source },
      status,
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('❌ Failed to save machine status:', err.message);
  }
}

module.exports = saveMachineStatus;
