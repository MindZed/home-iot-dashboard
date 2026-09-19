// components/BottomNav.tsx
// Subtle, textless, floating glassmorphic bottom navigation pill.
// Designed with ultra-clear frosted glass, icon-only layout, and smooth active indicator.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Thermometer, Zap, Server, Settings } from "lucide-react";
import { feedback } from "@/lib/feedback";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "climate", label: "Climate", icon: Thermometer, href: "/climate" },
    { id: "energy", label: "Energy", icon: Zap, href: "/energy" },
    { id: "server", label: "Server", icon: Server, href: "/server" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 select-none">
      <nav className="relative flex items-center justify-between gap-1 px-3 py-2 rounded-full bg-[#111622]/65 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              onClick={() => feedback.playNavTap()}
              className="relative p-2.5 rounded-full flex items-center justify-center transition-all group"
            >
              {/* Subtle glass pill behind active icon */}
              {isActive && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-rose-500/20 border border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.25)]"
                />
              )}

              {/* Icon */}
              <Icon
                className={`w-5 h-5 relative z-10 transition-all duration-200 ${
                  isActive
                    ? "text-orange-400 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                    : "text-neutral-400 group-hover:text-neutral-200 group-hover:scale-105"
                }`}
              />

              {/* Subtle active glow dot below icon */}
              {isActive && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(249,115,22,0.9)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}