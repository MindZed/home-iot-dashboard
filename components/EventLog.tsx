"use client";

import { motion } from "framer-motion";
import { LogEntry } from "@/hooks/useIoTData";

interface EventLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function EventLog({ logs, onClear }: EventLogProps) {
  return (
    <motion.section
      className="rounded-2xl bg-[#0a0a0a] border border-neutral-800 p-4 shadow-sm"
      aria-label="Event Log"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          📋 Event Log
        </h2>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="h-40 overflow-y-auto font-mono text-xs rounded bg-black/50 p-3 border border-neutral-800/50">
        {logs.length === 0 ? (
          <p className="text-neutral-600 text-center italic mt-12">
            No events recorded yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {logs.map((log, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-neutral-500 shrink-0">[{log.time}]</span>
                <span
                  className={
                    log.type === "alert"
                      ? "text-amber-400 font-semibold"
                      : "text-green-400"
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
