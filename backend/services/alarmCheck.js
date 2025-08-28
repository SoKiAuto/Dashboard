const mongoose = require("mongoose");
const Alarm = require("../models/Alarm");

// This must match the setpoints collection name you're using
const Setpoint = mongoose.connection.collection("Sentinel-VM_setpoints");

async function checkAlarms(reading) {
  try {
    const { channel, values, timestamp } = reading;

    // Load channel-specific setpoints
    const setpoint = await Setpoint.findOne({ channel });
    if (!setpoint) return;

    for (const [metric, value] of Object.entries(values)) {
      if (value == null || value === undefined) continue;

      const thresholds = setpoint[metric];
      if (!thresholds) continue;

      // 👇 Special case: Bias Voltage → min/max thresholds
      if (metric === "Bias_Voltage") {
        let breached = false;

        if ("min" in thresholds && value < thresholds.min) {
          await raiseAlarm(channel, metric, "alarm", value, thresholds.min, timestamp);
          breached = true;
        }

        if ("max" in thresholds && value > thresholds.max) {
          await raiseAlarm(channel, metric, "alarm", value, thresholds.max, timestamp);
          breached = true;
        }

        if (!breached) await resolveAlarms(channel, metric);
        continue;
      }

      // 👇 General case: warning/alarm
      if ("alarm" in thresholds && value >= thresholds.alarm) {
        await raiseAlarm(channel, metric, "alarm", value, thresholds.alarm, timestamp);
      } else if ("warning" in thresholds && value >= thresholds.warning) {
        await raiseAlarm(channel, metric, "warning", value, thresholds.warning, timestamp);
      } else {
        await resolveAlarms(channel, metric);
      }
    }
  } catch (err) {
    console.error(`❌ Alarm check failed for Ch${reading.channel}:`, err.message);
  }
}

async function raiseAlarm(channel, metric, level, value, threshold, timestamp) {
  const existing = await Alarm.findOne({
    channel,
    metric,
    level,
    resolved: false
  });

  if (existing) return; // Already active, skip

  const message = `${metric.replace(/_/g, " ")} exceeded ${level} threshold`;

  const alarm = new Alarm({
    channel,
    metric,
    level,
    value,
    threshold,
    message,
    timestamp
  });

  await alarm.save();
  console.log(
    `🚨 ALARM: Ch${channel} ${metric} → ${level.toUpperCase()} (${value} >= ${threshold})`
  );
}

async function resolveAlarms(channel, metric) {
  const result = await Alarm.updateMany(
    { channel, metric, resolved: false },
    { $set: { resolved: true, resolvedAt: new Date() } }
  );

  if (result.modifiedCount > 0) {
    console.log(`✅ RESOLVED: Ch${channel} ${metric} (${result.modifiedCount})`);
  }
}

module.exports = checkAlarms;
