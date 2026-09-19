// components/TimerModal.tsx
// Two-Way Edge Timer Modal with an interactive 360° rotary dial (360° = 1 hour, accumulates up to 24h).
// If device is ON  -> Auto-OFF Timer (schedules turn OFF)
// If device is OFF -> Auto-ON Timer (schedules turn ON)

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Power, Play, RotateCcw, Plus, Minus } from "lucide-react";
import { feedback } from "@/lib/feedback";

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: number;
  deviceTitle: string;
  hasLoad: boolean; // Source of truth: CT sensor
  activeTimerSec?: number;
  onSetTimer: (id: number, seconds: number, action: "off" | "on") => void;
}

export default function TimerModal({
  isOpen,
  onClose,
  deviceId,
  deviceTitle,
  hasLoad,
  activeTimerSec = 0,
  onSetTimer,
}: TimerModalProps) {
  // Total minutes selected: range 1 to 1440 (24 hours)
  const [totalMinutes, setTotalMinutes] = useState<number>(() => {
    if (activeTimerSec > 0) {
      return Math.max(1, Math.round(activeTimerSec / 60));
    }
    return 15; // default 15m
  });

  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<SVGSVGElement | null>(null);
  const prevAngleRef = useRef<number>(0);

  // Sync with activeTimerSec when modal opens
  useEffect(() => {
    if (isOpen) {
      if (activeTimerSec > 0) {
        setTotalMinutes(Math.max(1, Math.round(activeTimerSec / 60)));
      } else {
        setTotalMinutes(15);
      }
    }
  }, [isOpen, activeTimerSec]);

  // Two-way action determination
  const action: "off" | "on" = hasLoad ? "off" : "on";

  // Rotary calculations
  // 1 full turn (360°) = 60 minutes.
  // hours = Math.floor(totalMinutes / 60); minutesInHour = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutesInHour = totalMinutes % 60;
  const dialAngle = (minutesInHour / 60) * 360;

  // Compute angle from dial center
  const getAngleFromEvent = useCallback((e: MouseEvent | TouchEvent | React.PointerEvent) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Angle clockwise from top (12 o'clock)
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    return deg;
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    const angle = getAngleFromEvent(e);
    prevAngleRef.current = angle;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentAngle = getAngleFromEvent(e);
    let delta = currentAngle - prevAngleRef.current;

    // Handle crossing 0°/360° boundary
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;

    prevAngleRef.current = currentAngle;

    // Convert delta degrees to delta minutes (360° = 60 mins -> 6° = 1 min)
    const deltaMins = delta / 6;

    setTotalMinutes((prev) => {
      const next = Math.round(prev + deltaMins);
      const clamped = Math.max(1, Math.min(1440, next));
      if (clamped !== prev) {
        feedback.playDialTick();
      }
      return clamped;
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const adjustMinutes = (delta: number) => {
    feedback.playDialTick();
    setTotalMinutes((prev) => Math.max(1, Math.min(1440, prev + delta)));
  };

  const handleSave = () => {
    feedback.playSwitchClick(true);
    const durationSeconds = totalMinutes * 60;
    onSetTimer(deviceId, durationSeconds, action);
    onClose();
  };

  const handleCancelTimer = () => {
    feedback.playSwitchClick(false);
    onSetTimer(deviceId, 0, action);
    onClose();
  };

  // Dial geometry
  const center = 110;
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Progress fraction of the current hour (or full circle if multiple hours)
  const strokeDashoffset = circumference - (dialAngle / 360) * circumference;

  // Knob position at current dialAngle
  const knobRad = ((dialAngle - 90) * Math.PI) / 180;
  const knobX = center + radius * Math.cos(knobRad);
  const knobY = center + radius * Math.sin(knobRad);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-sm rounded-3xl bg-[#111622] border border-white/10 shadow-2xl p-6 text-white overflow-hidden"
          >
            {/* Ambient warm gradient glow */}
            <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{deviceTitle}</h3>
                  <p className="text-[11px] text-neutral-400">On-Device Edge Timer</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Two-Way Mode Banner */}
            <div className="mt-4 p-3 rounded-2xl bg-[#171D2B] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                    hasLoad
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">
                    {hasLoad ? "Auto-OFF Timer" : "Auto-ON Timer"}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {hasLoad
                      ? "Device is active → will turn OFF when timer finishes"
                      : "Device is off → will turn ON when timer finishes"}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  hasLoad
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                {hasLoad ? "Turn Off" : "Turn On"}
              </span>
            </div>

            {/* Rotary Dial Container */}
            <div className="relative flex flex-col items-center justify-center my-5">
              <svg
                ref={dialRef}
                width={220}
                height={220}
                className="touch-none cursor-pointer"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <defs>
                  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                </defs>

                {/* Dial Background Track */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="#1D2433"
                  strokeWidth={strokeWidth}
                  fill="none"
                />

                {/* Dial Ticks (Every 5 mins) */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const tickAngle = ((i * 30 - 90) * Math.PI) / 180;
                  const inner = radius - 15;
                  const outer = radius - 22;
                  const x1 = center + inner * Math.cos(tickAngle);
                  const y1 = center + inner * Math.sin(tickAngle);
                  const x2 = center + outer * Math.cos(tickAngle);
                  const y2 = center + outer * Math.sin(tickAngle);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={i % 3 === 0 ? "#64748b" : "#334155"}
                      strokeWidth={i % 3 === 0 ? 2 : 1}
                    />
                  );
                })}

                {/* Progress Arc */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="url(#timerGrad)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(-90 ${center} ${center})`}
                />

                {/* Indicator Knob */}
                <circle
                  cx={knobX}
                  cy={knobY}
                  r={10}
                  fill="#ffffff"
                  stroke="#f97316"
                  strokeWidth={3}
                  className="filter drop-shadow-md"
                />
              </svg>

              {/* Center Digital Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow">
                  {hours > 0 ? `${hours}h ${minutesInHour}m` : `${minutesInHour}m`}
                </span>
                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider mt-0.5">
                  {hours > 0 ? `${totalMinutes} minutes total` : "360° = 1 Hour"}
                </span>
                {hours > 0 && (
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    ({hours} turn{hours > 1 ? "s" : ""} + {minutesInHour}m)
                  </span>
                )}
              </div>
            </div>

            {/* Fine Adjust Buttons ([-] / [+]) */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                onClick={() => adjustMinutes(-5)}
                className="p-2 rounded-xl bg-[#171D2B] border border-white/10 hover:bg-white/10 text-neutral-300 active:scale-95 transition-all"
                title="-5 Minutes"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs text-neutral-400 font-semibold px-2">
                Rotate dial or tap buttons
              </span>
              <button
                onClick={() => adjustMinutes(5)}
                className="p-2 rounded-xl bg-[#171D2B] border border-white/10 hover:bg-white/10 text-neutral-300 active:scale-95 transition-all"
                title="+5 Minutes"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-1.5 mb-5">
              {[
                { label: "5m", val: 5 },
                { label: "15m", val: 15 },
                { label: "30m", val: 30 },
                { label: "1h", val: 60 },
                { label: "2h", val: 120 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setTotalMinutes(p.val)}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    totalMinutes === p.val
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-[#171D2B] text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {activeTimerSec > 0 ? (
                <button
                  onClick={handleCancelTimer}
                  className="flex-1 py-3 rounded-2xl bg-[#1C2333] border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/10 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Cancel Timer
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-[#1C2333] text-neutral-300 font-semibold text-xs hover:bg-white/10 active:scale-95 transition-all"
                >
                  Close
                </button>
              )}

              <button
                onClick={handleSave}
                className="flex-[1.4] py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start {hasLoad ? "Off" : "On"} Timer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
