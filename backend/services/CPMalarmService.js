const CPMAlarms = require("../Schema/CPM_Alarms");
const CPMAlarmConfig = require("../Schema/CPM_Alarm_Config");
const logger = require("../utils/logger");

class CPMalarmService {
  /**
   * Main method to check and handle alarms
   * @param {String} deviceId
   * @param {Object} structuredData
   */
  static async checkAlarms(deviceId, structuredData) {
    try {
      if (!deviceId || !structuredData) return;

      // 1. Get all alarm configs for metrics
      const configs = await CPMAlarmConfig.find({}).lean();
      if (!configs || configs.length === 0) {
        logger.warn("⚠️ No alarm configs found");
        return;
      }

      for (const cfg of configs) {
        const metricPath = cfg.metric.split(".");
        const liveValue = this.getMetricValue(structuredData, metricPath);

        if (liveValue === undefined || liveValue === null) continue;

        // HH Alarm Check
        if (cfg.HH_Enable && liveValue >= cfg.HH_Setpoint) {
          await this.triggerOrUpdateAlarm(deviceId, cfg, liveValue, "HH", "critical");
          continue;
        }

        // H Alarm Check
        if (cfg.H_Enable && liveValue >= cfg.H_Setpoint) {
          await this.triggerOrUpdateAlarm(deviceId, cfg, liveValue, "H", "warning");
          continue;
        }

        // L Alarm Check
        if (cfg.L_Enable && liveValue <= cfg.L_Setpoint) {
          await this.triggerOrUpdateAlarm(deviceId, cfg, liveValue, "L", "warning");
          continue;
        }

        // LL Alarm Check
        if (cfg.LL_Enable && liveValue <= cfg.LL_Setpoint) {
          await this.triggerOrUpdateAlarm(deviceId, cfg, liveValue, "LL", "critical");
          continue;
        }

        // If metric is normal → resolve active alarms
        await this.resolveActiveAlarms(deviceId, cfg.metric, liveValue);
      }
    } catch (err) {
      logger.error(`❌ Error checking alarms for ${deviceId}: ${err.message}`);
    }
  }

  /**
   * Get nested metric value from structured data
   */
  static getMetricValue(structuredData, metricPath) {
    try {
      let current = structuredData;
      for (const key of metricPath) {
        if (current && current.hasOwnProperty(key)) {
          current = current[key];
        } else {
          return undefined;
        }
      }
      return current;
    } catch {
      return undefined;
    }
  }

  /**
   * Trigger new alarm or update existing one
   */
  static async triggerOrUpdateAlarm(deviceId, cfg, value, alarmType, severity) {
    try {
      const existing = await CPMAlarms.findOne({
        deviceId,
        metric: cfg.metric,
        alarmType,
        status: "active",
      });

      if (existing) {
        // Alarm already active → just update timestamp and actualValue
        existing.actualValue = value;
        existing.triggeredAt = new Date();
        await existing.save();
        logger.info(`🔄 Alarm updated: ${cfg.metric} [${alarmType}] = ${value}`);
        return;
      }

      // New alarm → insert into CPM_Alarms
      await CPMAlarms.create({
        deviceId,
        metric: cfg.metric,
        displayName: cfg.displayName,
        unit: cfg.unit,
        category: cfg.category,
        alarmType,
        severity,
        threshold: cfg[`${alarmType}_Setpoint`],
        actualValue: value,
        status: "active",
        triggeredAt: new Date(),
        resolvedAt: null,
        description: cfg.description || `${cfg.displayName} crossed ${alarmType} limit`,
        notified: {
          email: false,
          sms: false,
          dashboard: true,
        },
      });

      logger.warn(
        `🚨 Alarm triggered → ${cfg.metric} | Type: ${alarmType} | Value: ${value}`
      );
    } catch (err) {
      logger.error(`❌ Error triggering alarm for ${cfg.metric}: ${err.message}`);
    }
  }

  /**
   * Resolve active alarms when values return to normal
   */
  static async resolveActiveAlarms(deviceId, metric, liveValue) {
    try {
      const activeAlarms = await CPMAlarms.find({
        deviceId,
        metric,
        status: "active",
      });

      for (const alarm of activeAlarms) {
        alarm.status = "resolved";
        alarm.resolvedAt = new Date();
        await alarm.save();

        logger.success(
          `✅ Alarm resolved → ${metric} | Was: ${alarm.actualValue} | Now: ${liveValue}`
        );
      }
    } catch (err) {
      logger.error(`❌ Error resolving alarms for ${metric}: ${err.message}`);
    }
  }
}

module.exports = CPMalarmService;
