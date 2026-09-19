// components/DeviceCard.tsx
// 2x2 Grid Device Card inspired by Screen 1 of the reference smart home design.
// Active state lights up with a vibrant sunset-orange gradient glow.
// Visual state is driven 100% by CT sensor current flow (`hasLoad`).

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Fan,
  PlugZap,
  Flame,
  Clock,
  Wifi,
  Radio,
} from "lucide-react";
import TimerModal from "./TimerModal";
import { feedback } from "@/lib/feedback";

interface DeviceCardProps {
  id: number;
  title: string;
  type: "light" | "fan" | "plug" | "heater";
  hasLoad: boolean; // CT sensor — source of truth for ON/OFF
  onToggle: (id: number) => void;
  isPending?: boolean;
  timerSec?: number;
  timerAction?: "off" | "on" | "none";
  onSetTimer?: (id: number, seconds: number, action: "off" | "on") => void;
}

export default function DeviceCard({
  id,
  title,
  type,
  hasLoad,
  onToggle,
  isPending = false,
  timerSec = 0,
  timerAction = "none",
  onSetTimer,
}: DeviceCardProps) {
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

  // Select matching Lucide vector icon
  const renderIcon = () => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case "light":
        return <Lightbulb className={iconClass} />;
      case "fan":
        return <Fan className={`${iconClass} ${hasLoad ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />;
      case "heater":
        return <Flame className={iconClass} />;
      case "plug":
      default:
        return <PlugZap className={iconClass} />;
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (mins === 0) return `${remainingSec}s`;
    if (mins < 60) return `${mins}m ${remainingSec > 0 ? `${remainingSec}s` : ""}`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative rounded-3xl p-4 flex flex-col justify-between min-h-[160px]
          transition-all duration-300 select-none overflow-hidden
          ${
            hasLoad
              ? "bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white shadow-xl shadow-orange-600/30 border border-orange-400/40"
              : "bg-[#121722]/90 text-neutral-300 border border-white/[0.08] shadow-md hover:border-white/20"
          }
        `}
      >
        {/* Top ambient highlight on active card */}
        {hasLoad && (
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-white/20 blur-xl pointer-events-none" />
        )}

        {/* Top Row: Icon Badge + Signal / Timer Status */}
        <div className="flex items-center justify-between">
          <div
            className={`
              w-11 h-11 rounded-2xl flex items-center justify-center transition-colors
              ${
                hasLoad
                  ? "bg-white/20 backdrop-blur-md text-white shadow-inner"
                  : "bg-[#1C2333] text-neutral-400 border border-white/[0.06]"
              }
            `}
          >
            {renderIcon()}
          </div>

          <div className="flex items-center gap-1.5">
            {timerSec > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTimerModalOpen(true);
                }}
                className={`
                  flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border
                  transition-all animate-pulse
                  ${
                    hasLoad
                      ? "bg-black/30 border-white/30 text-white"
                      : "bg-orange-500/20 border-orange-500/40 text-orange-400"
                  }
                `}
                title="Click to manage edge timer"
              >
                <Clock className="w-3 h-3" />
                <span>{formatTimer(timerSec)}</span>
              </button>
            ) : (
              <span
                className={`text-[11px] p-1.5 rounded-full ${
                  hasLoad ? "text-white/70" : "text-neutral-500"
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Middle Row: Title & Subtitle */}
        <div className="my-2">
          <h3
            className={`font-bold text-sm tracking-tight line-clamp-1 ${
              hasLoad ? "text-white" : "text-white"
            }`}
          >
            {title}
          </h3>

          <p
            className={`text-[11px] font-medium mt-0.5 ${
              hasLoad ? "text-white/85" : "text-neutral-400"
            }`}
          >
            {timerSec > 0
              ? `${timerAction === "off" ? "Auto-OFF" : "Auto-ON"} in ${formatTimer(timerSec)}`
              : hasLoad
              ? "Active • Load ON"
              : "Standby • Load OFF"}
          </p>
        </div>

        {/* Bottom Row: Quick Timer Modal Trigger + Toggle Switch */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.08]">
          {/* Timer dialog button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              feedback.triggerHaptic("light");
              setIsTimerModalOpen(true);
            }}
            className={`
              p-1.5 rounded-xl text-xs transition-all flex items-center gap-1 font-semibold
              ${
                hasLoad
                  ? "bg-black/20 hover:bg-black/30 text-white"
                  : "bg-[#1B2232] hover:bg-[#252F45] text-neutral-300"
              }
            `}
            title="Set on-device edge timer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px]">Timer</span>
          </button>

          {/* Toggle Switch */}
          <button
            onClick={() => {
              feedback.playSwitchClick(!hasLoad);
              onToggle(id);
            }}
            aria-label={`Toggle ${title}`}
            aria-busy={isPending}
            disabled={isPending}
            className={`
              relative w-12 h-7 flex items-center rounded-full p-1
              transition-all duration-300 focus:outline-none
              disabled:cursor-wait disabled:opacity-80
              ${
                isPending
                  ? "bg-amber-300 shadow-[0_0_0_4px_rgba(251,191,36,0.3)]"
                  : hasLoad
                  ? "bg-white/95"
                  : "bg-[#252E42]"
              }
            `}
          >
            {isPending && (
              <span
                className="absolute inset-0 rounded-full overflow-hidden"
                aria-hidden="true"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1s_infinite]" />
              </span>
            )}
            <motion.div
              layout
              className={`
                w-5 h-5 rounded-full shadow-md transform transition-all duration-300
                ${
                  hasLoad
                    ? "translate-x-5 bg-orange-600"
                    : "translate-x-0 bg-neutral-400"
                }
              `}
            />
          </button>
        </div>
      </motion.div>

      {/* Two-Way Rotary Timer Modal */}
      {onSetTimer && (
        <TimerModal
          isOpen={isTimerModalOpen}
          onClose={() => setIsTimerModalOpen(false)}
          deviceId={id}
          deviceTitle={title}
          hasLoad={hasLoad}
          activeTimerSec={timerSec}
          onSetTimer={onSetTimer}
        />
      )}
    </>
  );
}