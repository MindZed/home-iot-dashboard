// components/BottomNav.tsx
// Floating glassmorphism bottom navigation bar with Lucide icons.
// Mobile-first PWA optimized with safe-area spacing and active indicator.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Thermometer, Zap, Server, Settings } from "lucide-react";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function BottomNav({ activeTab = "home", onTabChange }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "climate", label: "Climate", icon: Thermometer, href: "/#climate" },
    { id: "energy", label: "Energy", icon: Zap, href: "/#energy" },
    { id: "server", label: "Server", icon: Server, href: "/#server" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ];

  const handleClick = (id: string, href: string) => {
    if (onTabChange) {
      onTabChange(id);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-40 select-none">
      <nav className="rounded-full bg-[#10141D]/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === "/settings"
              ? item.id === "settings"
              : activeTab === item.id || (item.id === "home" && !activeTab);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => handleClick(item.id, item.href)}
              className={`
                relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-300
                ${
                  isActive
                    ? "text-orange-400 font-bold"
                    : "text-neutral-400 hover:text-white"
                }
              `}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>

              {/* Active glow dot */}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}