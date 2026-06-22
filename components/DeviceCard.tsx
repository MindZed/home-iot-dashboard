// components/DeviceCard.tsx
// Renders a single smart device control card.
// CRITICAL: The visual ON/OFF state is driven entirely by the `hasLoad` prop (CT sensor),
// NOT by the relay state. In a 2-way switching setup, only current flow tells the truth.

"use client";

interface DeviceCardProps {
  id: number;
  title: string;
  type: "light" | "fan" | "plug";
  hasLoad: boolean; // CT sensor — this IS the source of truth for ON/OFF
  onToggle: (id: number) => void;
}

export default function DeviceCard({
  id,
  title,
  type,
  hasLoad,
  onToggle,
}: DeviceCardProps) {
  const getIcon = () => {
    if (type === "light") return "💡";
    if (type === "fan") return "🌀";
    return "🔌";
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-5 
        flex items-center justify-between
        transition-all duration-300
        ${
          hasLoad
            ? "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-md shadow-blue-100/50"
            : "bg-white border border-gray-200/80 shadow-sm"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={`
            flex items-center justify-center w-12 h-12 text-2xl rounded-xl
            transition-all duration-300
            ${
              hasLoad
                ? "bg-blue-500/15 scale-105"
                : "bg-gray-100"
            }
          `}
        >
          {getIcon()}
        </div>

        {/* Title & Status */}
        <div>
          <h3
            className={`font-semibold transition-colors duration-300 ${
              hasLoad ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {title}
          </h3>
          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              hasLoad ? "text-blue-600" : "text-gray-400"
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
        className={`
          relative w-14 h-8 flex items-center rounded-full p-1
          transition-colors duration-300 focus:outline-none
          focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
          ${hasLoad ? "bg-blue-500" : "bg-gray-300"}
        `}
      >
        <div
          className={`
            bg-white w-6 h-6 rounded-full shadow-md
            transform transition-transform duration-300
            ${hasLoad ? "translate-x-6" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}