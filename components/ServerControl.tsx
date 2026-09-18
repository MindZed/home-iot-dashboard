"use client";

import { motion } from "framer-motion";
import { ServerData } from "@/hooks/useIoTData";

interface ServerControlProps {
  server: ServerData;
  onWake: () => void;
}

export default function ServerControl({ server, onWake }: ServerControlProps) {
  const isOnline = server?.online;
  const isChecking = server?.checking;
  const isFailed = server?.failed;

  return (
    <motion.section
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800/90 p-5 shadow-sm transition-colors duration-300"
      aria-label="Home Server Control"
    >
      {/* Background subtle ambient glow when online */}
      {isOnline && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
      )}
      {isChecking && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${
              isOnline
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-xs"
                : isChecking
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 animate-pulse"
                : "bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500"
            }`}
          >
            🖥️
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Home Server
            </h2>
            <p className="text-xs text-gray-400 dark:text-neutral-400 font-mono">
              192.168.0.107 • SSH :22
            </p>
          </div>
        </div>

        {/* Status Pill Badge */}
        <div className="flex items-center">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Online
            </span>
          ) : isChecking ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/40">
              <svg
                className="animate-spin h-3 w-3 text-amber-600 dark:text-amber-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Booting...
            </span>
          ) : isFailed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100/80 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200/80 dark:border-red-800/40">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Timed Out
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-neutral-600"></span>
              Sleeping
            </span>
          )}
        </div>
      </div>

      {/* Description / Feedback Text */}
      <div className="text-xs text-gray-500 dark:text-neutral-400 mb-4 pl-1">
        {isOnline ? (
          <p className="text-emerald-700 dark:text-emerald-400 font-medium">
            ✓ Server is actively responding on port 22. Heavy services are operational.
          </p>
        ) : isChecking ? (
          <p className="text-amber-700 dark:text-amber-400 font-medium">
            ⏳ Wake-on-LAN packet broadcasted. Awaiting network interface initialization...
          </p>
        ) : isFailed ? (
          <p className="text-red-600 dark:text-red-400">
            ⚠️ No response after 2 minutes. Check host power, ethernet cable, or BIOS WoL setting.
          </p>
        ) : (
          <p>
            Host is in low-power sleep mode. Tap below to send a local Wake-on-LAN magic packet.
          </p>
        )}
      </div>

      {/* Action Button */}
      <motion.button
        whileTap={{ scale: isOnline || isChecking ? 1 : 0.97 }}
        whileHover={{ scale: isOnline || isChecking ? 1 : 1.01 }}
        onClick={onWake}
        disabled={isOnline || isChecking}
        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
          isOnline
            ? "bg-gray-100 dark:bg-neutral-800/80 text-gray-400 dark:text-neutral-500 cursor-default"
            : isChecking
            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 cursor-wait"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 active:shadow-sm"
        }`}
      >
        {isOnline ? (
          <>
            <span>⚡</span>
            <span>Server Running</span>
          </>
        ) : isChecking ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Sending Magic Packet...</span>
          </>
        ) : isFailed ? (
          <>
            <span>🔄</span>
            <span>Retry Wake-on-LAN</span>
          </>
        ) : (
          <>
            <span>⚡</span>
            <span>Wake Up Server</span>
          </>
        )}
      </motion.button>
    </motion.section>
  );
}
