// components/QuickScenes.tsx
// Horizontal quick scene pills matching the category selector on Screen 1 of reference design.

"use client";

import { motion } from "framer-motion";
import { PowerOff, Briefcase, Moon, Zap } from "lucide-react";
import { RelayData } from "@/hooks/useIoTData";
import { feedback } from "@/lib/feedback";

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
    ensureDeviceState(1, relays.ct1, true); // Socket ON
    ensureDeviceState(4, relays.ct4, true); // Desk Light ON
    ensureDeviceState(3, relays.ct3, true); // Fan ON
    ensureDeviceState(2, relays.ct2, false); // Main Light OFF
  };

  const handleNightMode = () => {
    ensureDeviceState(2, relays.ct2, false); // Main Light OFF
    ensureDeviceState(4, relays.ct4, false); // Desk Light OFF
    ensureDeviceState(3, relays.ct3, true); // Fan ON
  };

  const handleAllOn = () => {
    ensureDeviceState(1, relays.ct1, true);
    ensureDeviceState(2, relays.ct2, true);
    ensureDeviceState(3, relays.ct3, true);
    ensureDeviceState(4, relays.ct4, true);
  };

  // Determine active preset (if current state matches)
  const isAllOffActive = !isAnyOn;
  const isWorkActive = relays.ct1 && relays.ct4 && relays.ct3 && !relays.ct2;
  const isNightActive = !relays.ct2 && !relays.ct4 && relays.ct3;
  const isAllOnActive = relays.ct1 && relays.ct2 && relays.ct3 && relays.ct4;

  const scenes = [
    {
      id: "all-off",
      title: "All Off",
      subtitle: "Leave Home",
      icon: PowerOff,
      active: isAllOffActive,
      action: handleAllOff,
    },
    {
      id: "work",
      title: "Work Mode",
      subtitle: "Focus",
      icon: Briefcase,
      active: isWorkActive,
      action: handleWorkMode,
    },
    {
      id: "night",
      title: "Night Mode",
      subtitle: "Sleep",
      icon: Moon,
      active: isNightActive,
      action: handleNightMode,
    },
    {
      id: "all-on",
      title: "All On",
      subtitle: "Full Power",
      icon: Zap,
      active: isAllOnActive,
      action: handleAllOn,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Quick Scenes
        </span>
        <span className="text-[10px] text-neutral-500 font-medium">1-Tap Automations</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {scenes.map((scene) => {
          const Icon = scene.icon;
          return (
            <motion.button
              key={scene.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                feedback.playSceneChime();
                scene.action();
              }}
              className={`
                flex items-center gap-2 px-3.5 py-2.5 rounded-2xl shrink-0 transition-all font-semibold text-xs
                ${
                  scene.active
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/25 border border-orange-400/40"
                    : "bg-[#131722] text-neutral-300 border border-white/[0.08] hover:bg-[#1B2232]"
                }
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${scene.active ? "text-white" : "text-orange-400"}`} />
              <span>{scene.title}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
