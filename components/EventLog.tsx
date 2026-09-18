// components/EventLog.tsx
// Live real-time event log for ESP32 relay activations, edge timers, and sensor events.

"use client";

import { motion } from "framer-motion";
import { ScrollText, Trash2 } from "lucide-react";
import { LogEntry } from "@/hooks/useIoTData";

interface EventLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function EventLog({ logs, onClear }: EventLogProps) {
  return (
    <motion.section
      className="rounded-3xl bg-[#121722] border border-white/10 p-5 shadow-xl select-none"
      aria-label="Event Log"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <ScrollText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-tight">Event Console</h2>
            <p className="text-[11px] text-neutral-400">Live Transition Log</p>
          </div>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-rose-400 transition-colors px-2.5 py-1 rounded-xl bg-[#171E2C] border border-white/[0.06]"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="h-36 overflow-y-auto font-mono text-xs rounded-2xl bg-[#0B0E14] p-3 border border-white/[0.06] space-y-1.5 no-scrollbar">
        {logs.length === 0 ? (
          <p className="text-neutral-500 text-center italic mt-12 text-[11px]">
            No live events recorded yet.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {logs.map((log, index) => (
              <li key={index} className="flex items-start gap-2 text-[11px]">
                <span className="text-neutral-500 font-medium shrink-0">
                  [{log.time}]
                </span>
                <span
                  className={
                    log.type === "alert"
                      ? "text-amber-400 font-semibold"
                      : "text-emerald-400 font-medium"
                  }
                >
                  {log.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
}
