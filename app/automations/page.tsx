"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { useIoTData } from "@/hooks/useIoTData";

const DEVICES = [
  { id: 1, title: "Socket", type: "plug" as const },
  { id: 2, title: "Main Light", type: "light" as const },
  { id: 3, title: "Fan", type: "fan" as const },
  { id: 4, title: "Desk Light", type: "light" as const },
];

type TimerState = Record<
  number,
  { durationSeconds: number; remainingSeconds: number; endTime: number }
>;

export default function AutomationsPage() {
  const { data, error, toggleRelay, pendingRelayIds } = useIoTData();
  const [timers, setTimers] = useState<TimerState>({});
  const [customMinutes, setCustomMinutes] = useState<Record<number, string>>({});
  const latestLoadStateRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    if (!data) return;
    latestLoadStateRef.current = {
      1: data.relays.ct1,
      2: data.relays.ct2,
      3: data.relays.ct3,
      4: data.relays.ct4,
    };
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expiredIds: number[] = [];

      setTimers((current) => {
        const next: TimerState = {};
        for (const [id, timer] of Object.entries(current)) {
          const relayId = Number(id);
          const remainingSeconds = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
          if (remainingSeconds === 0) {
            expiredIds.push(relayId);
            continue;
          }
          next[relayId] = { ...timer, remainingSeconds };
        }
        return next;
      });

      for (const id of expiredIds) {
        if (latestLoadStateRef.current[id]) {
          void toggleRelay(id);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [toggleRelay]);

  const startTimer = (id: number, minutes: number) => {
    const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
    const durationSeconds = Math.floor(safeMinutes * 60);
    if (durationSeconds <= 0) return;

    if (!latestLoadStateRef.current[id]) {
      void toggleRelay(id);
    }

    const endTime = Date.now() + durationSeconds * 1000;
    setTimers((current) => ({
      ...current,
      [id]: { durationSeconds, remainingSeconds: durationSeconds, endTime },
    }));
  };

  const cancelTimer = (id: number) => {
    setTimers((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-neutral-950 font-sans transition-colors duration-300">
      <main className="flex-1 overflow-y-auto p-5 pb-24">
        <motion.div
          className="max-w-md mx-auto space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <header className="pt-3 pb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automations</h1>
            <p className="mt-0.5 text-sm font-medium text-gray-500 dark:text-neutral-400">
              Set auto-off timers for each switch
            </p>
            {error && (
              <span className="inline-flex mt-2 text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-medium">
                ⚠ Offline mode
              </span>
            )}
          </header>

          {DEVICES.map((device) => {
            const timer = timers[device.id];
            const progress = timer
              ? Math.max(0, Math.min(100, (timer.remainingSeconds / timer.durationSeconds) * 100))
              : 0;

            return (
              <section
                key={device.id}
                className="rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 dark:text-white">{device.title}</h2>
                  <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">
                    Relay {device.id}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <PresetButton label="1 min" onClick={() => startTimer(device.id, 1)} />
                  <PresetButton label="10 min" onClick={() => startTimer(device.id, 10)} />
                  <PresetButton label="1 hr" onClick={() => startTimer(device.id, 60)} />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={customMinutes[device.id] ?? ""}
                    onChange={(e) =>
                      setCustomMinutes((current) => ({ ...current, [device.id]: e.target.value }))
                    }
                    placeholder="Custom minutes"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                  />
                  <button
                    onClick={() => startTimer(device.id, Number.parseFloat(customMinutes[device.id] ?? "0"))}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 dark:bg-red-600 text-white hover:opacity-90 transition-opacity"
                  >
                    Set
                  </button>
                </div>

                {timer && (
                  <div className="rounded-xl bg-blue-50/70 dark:bg-red-500/10 border border-blue-100 dark:border-red-500/20 p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-blue-700 dark:text-red-400">Auto-off in</span>
                      <span className="font-bold text-blue-800 dark:text-red-300">
                        {formatDuration(timer.remainingSeconds)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/70 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-red-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <button
                      onClick={() => cancelTimer(device.id)}
                      disabled={pendingRelayIds.includes(device.id)}
                      className="text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-60"
                    >
                      Cancel timer
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 bg-gray-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-red-500/10 hover:border-blue-200 dark:hover:border-red-500/30 transition-colors"
    >
      {label}
    </button>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
