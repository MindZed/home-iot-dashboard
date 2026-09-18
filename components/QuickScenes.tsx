"use client";

import { motion } from "framer-motion";
import { RelayData } from "@/hooks/useIoTData";

interface QuickScenesProps {
  relays: RelayData;
  onToggle: (id: number) => void;
  pendingRelayIds: number[];
}

export default function QuickScenes({ relays, onToggle, pendingRelayIds }: QuickScenesProps) {
  const isAnyOn = relays.ct1 || relays.ct2 || relays.ct3 || relays.ct4;

  const ensureDeviceState = (id: number, currentActive: boolean, desiredActive: boolean) => {
    if (currentActive !== desiredActive && !pendingRelayIds.includes(id)) {
      onToggle(id);
    }
  };

  const handleAllOff = () => {
    ensureDeviceState(1, relays.ct1, false);
    ensureDeviceState(2, relays.ct2, false);
    ensureDeviceState(3, relays.ct3, false);
    ensureDeviceState(4, relays.ct4, false);
  };

  const handleWorkMode = () => {
    ensureDeviceState(1, relays.ct1, true);  // Socket ON
    ensureDeviceState(4, relays.ct4, true);  // Desk Light ON
    ensureDeviceState(3, relays.ct3, true);  // Fan ON
    ensureDeviceState(2, relays.ct2, false); // Main Light OFF
  };

  const handleNightMode = () => {
    ensureDeviceState(2, relays.ct2, false); // Main Light OFF
    ensureDeviceState(4, relays.ct4, false); // Desk Light OFF
    ensureDeviceState(3, relays.ct3, true);  // Fan ON
  };

  const handleAllOn = () => {
    ensureDeviceState(1, relays.ct1, true);
    ensureDeviceState(2, relays.ct2, true);
    ensureDeviceState(3, relays.ct3, true);
    ensureDeviceState(4, relays.ct4, true);
  };

  return (
    <section className="space-y-2.5" aria-label="Quick Scenes">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
          ⚡ Quick Scenes
        </h2>
        <span className="text-[11px] font-medium text-gray-400 dark:text-neutral-500">
          1-Tap Automations
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* All Off / Leave Home */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleAllOff}
          disabled={!isAnyOn}
          className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
            isAnyOn
              ? "bg-white dark:bg-neutral-900 border-rose-200/80 dark:border-rose-900/40 hover:border-rose-400 shadow-xs"
              : "bg-gray-50/50 dark:bg-neutral-900/40 border-gray-200/50 dark:border-neutral-800/40 opacity-50 cursor-not-allowed"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-lg">🚪</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Leave
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">All Off</div>
            <div className="text-[11px] text-gray-500 dark:text-neutral-400">Kill all loads</div>
          </div>
        </motion.button>

        {/* Work / Focus */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleWorkMode}
          className="p-3 rounded-2xl border bg-white dark:bg-neutral-900 border-sky-200/80 dark:border-sky-900/40 hover:border-sky-400 shadow-xs text-left flex flex-col justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-lg">💼</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Focus
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">Work Mode</div>
            <div className="text-[11px] text-gray-500 dark:text-neutral-400">Desk + Fan ON</div>
          </div>
        </motion.button>

        {/* Night Mode */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleNightMode}
          className="p-3 rounded-2xl border bg-white dark:bg-neutral-900 border-indigo-200/80 dark:border-indigo-900/40 hover:border-indigo-400 shadow-xs text-left flex flex-col justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-lg">🌙</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Sleep
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">Night Mode</div>
            <div className="text-[11px] text-gray-500 dark:text-neutral-400">Lights OFF, Fan ON</div>
          </div>
        </motion.button>

        {/* All On */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleAllOn}
          className="p-3 rounded-2xl border bg-white dark:bg-neutral-900 border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-400 shadow-xs text-left flex flex-col justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-lg">💡</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Max
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">All On</div>
            <div className="text-[11px] text-gray-500 dark:text-neutral-400">Energize room</div>
          </div>
        </motion.button>
      </div>
    </section>
  );
}
