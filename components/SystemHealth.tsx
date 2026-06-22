"use client";

import { motion } from "framer-motion";
import { SysData } from "@/hooks/useIoTData";

export default function SystemHealth({ sys }: { sys: SysData }) {
  // Convert uptime seconds to hh:mm:ss
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // Convert RAM from bytes to KB or MB
  const formatRam = (bytes: number) => {
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <motion.section
      className="rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 p-4 shadow-sm transition-colors duration-300"
      aria-label="System Health"
    >
      <h2 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
        🖥️ System Health
      </h2>
      <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-200 dark:divide-neutral-800">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            {sys.cpuFreq} MHz
          </span>
          <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500">
            CPU Freq
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            {formatRam(sys.ramFree)}
          </span>
          <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500">
            Free RAM
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            {formatUptime(sys.uptime)}
          </span>
          <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500">
            Uptime
          </span>
        </div>
      </div>
    </motion.section>
  );
}
