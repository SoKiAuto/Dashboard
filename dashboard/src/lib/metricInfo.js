// src/lib/metricInfo.js

export const metricInfo = {
  Overall_RMS: {
    label: "Overall RMS",
    key: "Overall_RMS",
    description: `The combined vibration energy measured over time in a channel, representing overall machine vibration severity.`,
    usage: [
      "Primary health indicator: signals wear, imbalance, looseness, or faults.",
      "Set warning/alarm thresholds.",
      "Monitor trends over days/weeks.",
      "Set baseline during healthy operation."
    ],
    example: "If RMS goes from 0.3g to 1.2g in a week → indicates bearing wear.",
    color: "#38bdf8",
    unit: "g"
  },

  Waveform_RMS: {
    label: "Waveform RMS",
    key: "Waveform_RMS",
    description: `RMS from the actual vibration waveform (time-domain signal), capturing transient impacts and shocks.`,
    usage: [
      "Detect sudden mechanical shocks.",
      "Differentiate steady vs impulse faults.",
      "Use spikes as inspection triggers."
    ],
    example: "A sudden spike indicates a loose bolt or impact event.",
    color: "#34d399",
    unit: "g"
  },

  FFT_RMS: {
    label: "FFT RMS",
    key: "FFT_RMS",
    description: `RMS calculated in frequency domain (FFT), identifying faults by vibration frequencies.`,
    usage: [
      "Detect faults at specific frequency bands.",
      "Use spectral alarms.",
      "Track fault frequency growth."
    ],
    example: "Peak at bearing frequency → bearing degradation.",
    color: "#facc15",
    unit: "g"
  },

  Bias_Voltage: {
    label: "Voltage Bias",
    key: "Bias_Voltage",
    description: `DC bias voltage from the sensor, useful for checking sensor health.`,
    usage: [
      "Identify disconnected/damaged sensors.",
      "Auto-flag abnormal bias channels.",
      "Trigger inspection on drift."
    ],
    example: "Voltage drops to 0 → sensor unplugged or damaged.",
    color: "#f87171",
    unit: "V"
  },

  RPM: {
    label: "RPM",
    key: "RPM",
    description: `Rotations per minute of the monitored machine.`,
    usage: [
      "Correlate vibration spikes with speed.",
      "Calculate fault frequencies.",
      "Filter speed-related vibration."
    ],
    example: "Vibration increases only at 1400 RPM → possible resonance.",
    color: "#818cf8",
    unit: "RPM"
  },

  Rod_Drop_Data: {
    label: "Rod Drop Data",
    key: "Rod_Drop_Data",
    description: `Special vibration data from rod movement.`,
    usage: [
      "Detect dropped or slipping rods.",
      "Compare rod channels for imbalance.",
      "Monitor rod motion trend."
    ],
    example: "Sharp spike → rod dropped or loosened.",
    color: "#f472b6",
    unit: "mm/s"
  }
};
