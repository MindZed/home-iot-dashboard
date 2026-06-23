// components/BottomNav.tsx
// Fixed bottom navigation bar with Home, Automations, and Settings.
// Adjusted for dark mode.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 z-50 pb-safe transition-colors duration-300">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full transition-colors ${
            pathname === "/"
              ? "text-blue-500 dark:text-red-500"
              : "text-gray-400 hover:text-blue-500 dark:hover:text-red-500"
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-xs mt-1 font-medium">Home</span>
        </Link>

        <Link
          href="/automations"
          className={`flex flex-col items-center justify-center w-full transition-colors ${
            pathname === "/automations"
              ? "text-blue-500 dark:text-red-500"
              : "text-gray-400 hover:text-blue-500 dark:hover:text-red-500"
          }`}
        >
          <span className="text-xl">⚡</span>
          <span className="text-xs mt-1 font-medium">Automations</span>
        </Link>

        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center w-full transition-colors ${
            pathname === "/settings"
              ? "text-blue-500 dark:text-red-500"
              : "text-gray-400 hover:text-blue-500 dark:hover:text-red-500"
          }`}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-xs mt-1 font-medium">Settings</span>
        </Link>
      </div>
    </nav>
  );
}