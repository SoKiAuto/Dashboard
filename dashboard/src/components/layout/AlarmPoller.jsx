"use client";

import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi";
import '../../app/toastify.css';

export function AlarmPoller({ children }) {
  const lastTimestampRef = useRef(new Date(0).toISOString());
  const alarmSoundRef = useRef(null);
  const userInteractedRef = useRef(false); // 👈 track interaction

  useEffect(() => {
    // Initialize audio
    alarmSoundRef.current = new Audio("/sounds/alarm.mp3");
    alarmSoundRef.current.volume = 0.6;

    // Listen for first user interaction
    const enableSound = () => {
      userInteractedRef.current = true;
      // Try to play once silently to unlock
      alarmSoundRef.current?.play().then(() => {
        alarmSoundRef.current?.pause();
        alarmSoundRef.current.currentTime = 0;
      }).catch(() => { /* ignore */ });

      // Remove listeners
      window.removeEventListener("click", enableSound);
      window.removeEventListener("keydown", enableSound);
    };

    window.addEventListener("click", enableSound);
    window.addEventListener("keydown", enableSound);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/vm/alarms/latest?after=${encodeURIComponent(
            lastTimestampRef.current
          )}`
        );

        if (!res.ok) {
          console.error("Failed to fetch alarms:", await res.text());
          return;
        }

        const alarms = await res.json();

        if (alarms.length > 0) {
          const lastTs = alarms[alarms.length - 1].timestamp;
          if (new Date(lastTs) > new Date(lastTimestampRef.current)) {
            lastTimestampRef.current = lastTs;
          }

          alarms.forEach((alarm) => {
            // ✅ Play sound only after user interaction
            if (userInteractedRef.current && alarmSoundRef.current) {
              try {
                alarmSoundRef.current.currentTime = 0;
                alarmSoundRef.current.play();
              } catch (err) {
                console.warn("Sound play blocked:", err);
              }
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
        }
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
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
      {children}
    </>
  );
}
