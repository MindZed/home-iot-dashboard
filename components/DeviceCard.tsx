// components/DeviceCard.tsx
// Renders a single smart device control card.
// CRITICAL: The visual ON/OFF state is driven entirely by the `hasLoad` prop (CT sensor),
// NOT by the relay state. In a 2-way switching setup, only current flow tells the truth.

"use client";

import { motion, Variants } from "framer-motion";

interface DeviceCardProps {
  id: number;
  title: string;
  type: "light" | "fan" | "plug";
  hasLoad: boolean; // CT sensor — this IS the source of truth for ON/OFF
  onToggle: (id: number) => void;
  isPending?: boolean;
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
}: DeviceCardProps) {
  const getIcon = () => {
    if (type === "light") return "💡";
    if (type === "fan") return "🌀";
    return "🔌";
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-2xl p-5 
        flex items-center justify-between
        transition-colors duration-300
        ${
          hasLoad
            ? "bg-linear-to-br from-blue-50 to-indigo-50 dark:from-red-950/40 dark:to-neutral-900 border border-blue-200/60 dark:border-red-500/30 shadow-md shadow-blue-100/50 dark:shadow-red-500/10"
            : "bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 shadow-sm"
        }
      `}
    >
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
          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              hasLoad ? "text-blue-600 dark:text-red-400" : "text-gray-400 dark:text-neutral-500"
            }`}
          >
            {hasLoad ? "Active" : "Off"}
          </span>
        </div>
      </div>

      {/* Toggle Switch — fires n8n webhook, does NOT optimistically update */}
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
    </motion.div>
  );
}