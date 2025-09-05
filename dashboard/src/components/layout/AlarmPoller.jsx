"use client";

import { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi";
import '../../app/toastify.css';

export function AlarmPoller({ children }) {
  const lastTimestampRef = useRef(null); // ✅ start as null
  const alarmSoundRef = useRef(null);
  const userInteractedRef = useRef(false);

  useEffect(() => {
    // Initialize audio
    alarmSoundRef.current = new Audio("/sounds/alarm.mp3");
    alarmSoundRef.current.volume = 0.6;

    const enableSound = () => {
      userInteractedRef.current = true;
      alarmSoundRef.current?.play()
        .then(() => {
          alarmSoundRef.current?.pause();
          alarmSoundRef.current.currentTime = 0;
        })
        .catch(() => {});

      window.removeEventListener("click", enableSound);
      window.removeEventListener("keydown", enableSound);
    };

    window.addEventListener("click", enableSound);
    window.addEventListener("keydown", enableSound);

    const fetchLatestTimestamp = async () => {
      try {
        const res = await fetch(`/api/vm/alarms/latest?after=${encodeURIComponent(new Date().toISOString())}`);
        if (!res.ok) return;

        const alarms = await res.json();
        if (alarms.length > 0) {
          // set lastTimestampRef to the latest alarm timestamp already in DB
          lastTimestampRef.current = alarms[alarms.length - 1].timestamp;
        } else {
          // If no alarms, set to current time
          lastTimestampRef.current = new Date().toISOString();
        }
      } catch (err) {
        console.error("Error initializing lastTimestampRef:", err);
        lastTimestampRef.current = new Date().toISOString();
      }
    };

    fetchLatestTimestamp();

    const interval = setInterval(async () => {
      if (!lastTimestampRef.current) return;

      try {
        const res = await fetch(
          `/api/vm/alarms/latest?after=${encodeURIComponent(lastTimestampRef.current)}`
        );
        if (!res.ok) return;

        const alarms = await res.json();
        if (alarms.length === 0) return;

        // update lastTimestampRef
        const lastTs = alarms[alarms.length - 1].timestamp;
        lastTimestampRef.current = lastTs;

        alarms.forEach((alarm) => {
          if (userInteractedRef.current && alarmSoundRef.current) {
            try {
              alarmSoundRef.current.currentTime = 0;
              alarmSoundRef.current.play();
            } catch (err) {}
          }

          toast.custom(
            (t) => (
              <div
                role="alert"
                tabIndex={0}
                className={`my-toast ${t.visible ? 'animate-enter' : 'animate-leave'}`}
                style={{ cursor: 'pointer', maxWidth: 360 }}
                onClick={() => toast.dismiss(t.id)}
              >
                <FiAlertTriangle size={24} aria-hidden="true" />
                <div>
                  <strong style={{ fontSize: '1rem', lineHeight: 1.2 }}>
                    {alarm.message}
                  </strong>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: 4 }}>
                    Channel {alarm.channel} | {alarm.metric}
                  </div>
                </div>
              </div>
            ),
            { duration: 5000 }
          );
        });
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", enableSound);
      window.removeEventListener("keydown", enableSound);
    };
  }, []);

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }} />
      {children}
    </>
  );
}
