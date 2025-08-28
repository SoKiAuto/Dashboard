"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function ClientAlarmToast({ latestAlarm }) {
  useEffect(() => {
    if (latestAlarm && latestAlarm.message) {
      toast.warning(`🚨 New Alarm: ${latestAlarm.message}`);
    }
  }, [latestAlarm]);

  return null;
}
