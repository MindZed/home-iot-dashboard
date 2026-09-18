// components/DeviceCard.tsx
// Renders a single smart device control card with edge auto-off timer support.
// CRITICAL: The visual ON/OFF state is driven entirely by the `hasLoad` prop (CT sensor),
// NOT by the relay state. In a 2-way switching setup, only current flow tells the truth.

"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface DeviceCardProps {
  id: number;
  title: string;
  type: "light" | "fan" | "plug";
  hasLoad: boolean; // CT sensor — this IS the source of truth for ON/OFF
  onToggle: (id: number) => void;
  isPending?: boolean;
  timerSec?: number;
  onSetTimer?: (id: number, seconds: number) => void;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DeviceCard({
  id,
  title,
  type,
  hasLoad,
  onToggle,
  isPending = false,
  timerSec = 0,
  onSetTimer,
}: DeviceCardProps) {
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  const getIcon = () => {
    if (type === "light") return "💡";
    if (type === "fan") return "🌀";
    return "🔌";
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (mins === 0) return `${remainingSec}s`;
    return `${mins}m ${remainingSec > 0 ? `${remainingSec}s` : ""}`;
  };

  const handleSelectTimer = (sec: number) => {
    if (onSetTimer) {
      onSetTimer(id, sec);
    }
    setShowTimerMenu(false);
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`
        relative overflow-hidden rounded-2xl p-5 
        flex flex-col gap-3
        transition-colors duration-300
        ${
          hasLoad
            ? "bg-linear-to-br from-blue-50 to-indigo-50 dark:from-red-950/40 dark:to-neutral-900 border border-blue-200/60 dark:border-red-500/30 shadow-md shadow-blue-100/50 dark:shadow-red-500/10"
            : "bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 shadow-sm"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={`
              flex items-center justify-center w-12 h-12 text-2xl rounded-xl
              transition-colors duration-300
              ${
                hasLoad
                  ? "bg-blue-500/15 dark:bg-red-500/20 scale-105"
                  : "bg-gray-100 dark:bg-neutral-800"
              }
            `}
          >
            {getIcon()}
          </div>

          {/* Title & Status */}
          <div>
            <h3
              className={`font-semibold transition-colors duration-300 ${
                hasLoad ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-neutral-400"
              }`}
            >
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  hasLoad ? "text-blue-600 dark:text-red-400" : "text-gray-400 dark:text-neutral-500"
                }`}
              >
                {hasLoad ? "Active" : "Off"}
              </span>

              {/* Edge countdown pill if timer is active */}
              {timerSec > 0 && (
                <span
                  onClick={() => handleSelectTimer(0)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300/60 dark:border-amber-700/40 cursor-pointer hover:bg-amber-200 transition-colors"
                  title="Click to cancel timer"
                >
                  <span className="animate-pulse">⏱️</span> {formatTimer(timerSec)}
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold ml-0.5">×</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side controls: Timer button & Toggle */}
        <div className="flex items-center gap-2.5">
          {onSetTimer && (
            <button
              onClick={() => setShowTimerMenu((prev) => !prev)}
              aria-label={`Set timer for ${title}`}
              className={`
                p-2 rounded-xl text-sm transition-all focus:outline-none
                ${
                  showTimerMenu || timerSec > 0
                    ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-700/40"
                    : "bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200/80 dark:hover:bg-neutral-700"
                }
              `}
              title="On-device edge timer"
            >
              ⏱️
            </button>
          )}

          {/* Toggle Switch */}
          <button
            onClick={() => onToggle(id)}
            aria-label={`Toggle ${title}`}
            aria-busy={isPending}
            disabled={isPending}
            className={`
              relative w-14 h-8 flex items-center rounded-full p-1
              transition-all duration-300 focus:outline-none
              focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-red-400 focus-visible:ring-offset-2
              disabled:cursor-wait disabled:opacity-80
              ${
                isPending
                  ? "bg-amber-400 dark:bg-amber-500 shadow-[0_0_0_6px_rgba(251,191,36,0.18)] dark:shadow-[0_0_0_6px_rgba(251,191,36,0.14)]"
                  : hasLoad
                    ? "bg-blue-500 dark:bg-red-600"
                    : "bg-gray-300 dark:bg-neutral-700"
              }
            `}
          >
            {isPending && (
              <span
                className="absolute inset-0 rounded-full overflow-hidden"
                aria-hidden="true"
              >
                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/35 to-transparent -translate-x-full animate-[shimmer_1.15s_infinite]" />
              </span>
            )}
            <motion.div
              layout
              className={`
                bg-white w-6 h-6 rounded-full shadow-md
                transform transition-all duration-300
                ${isPending ? "opacity-90 scale-95 ring-2 ring-amber-100 dark:ring-amber-200/40 bg-amber-50 dark:bg-amber-100" : "opacity-100"}
                ${hasLoad ? "translate-x-6" : "translate-x-0"}
              `}
            />
          </button>
        </div>
      </div>

      {/* Expandable Quick Timer Presets */}
      <AnimatePresence>
        {showTimerMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-2 border-t border-gray-100 dark:border-neutral-800/80"
          >
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 mb-2 font-medium">
              <span>On-Device Auto-Off Timer:</span>
              {timerSec > 0 && (
                <button
                  onClick={() => handleSelectTimer(0)}
                  className="text-red-500 dark:text-red-400 font-semibold hover:underline"
                >
                  Cancel Timer
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "5m", sec: 300 },
                { label: "15m", sec: 900 },
                { label: "30m", sec: 1800 },
                { label: "1h", sec: 3600 },
              ].map((preset) => (
                <button
                  key={preset.sec}
                  onClick={() => handleSelectTimer(preset.sec)}
                  className={`
                    py-1.5 px-2 rounded-xl text-xs font-semibold transition-all
                    ${
                      timerSec > 0 && Math.abs(timerSec - preset.sec) < 30
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-amber-100 dark:hover:bg-amber-950/40"
                    }
                  `}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}