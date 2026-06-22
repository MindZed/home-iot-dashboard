// components/BottomNav.tsx
// Fixed bottom navigation bar with Home, Automations, Settings, and Logout.
// Logout has a confirmation modal to prevent accidental taps on mobile.

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BottomNav() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      console.error("Logout failed");
      setLoggingOut(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* ── Bottom Navigation ──────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          
          <button className="flex flex-col items-center justify-center w-full text-blue-500">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1 font-medium">Home</span>
          </button>
          
          <button className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-blue-500 transition-colors">
            <span className="text-xl">⚡</span>
            <span className="text-xs mt-1 font-medium">Automations</span>
          </button>
          
          <button className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-blue-500 transition-colors">
            <span className="text-xl">⚙️</span>
            <span className="text-xs mt-1 font-medium">Settings</span>
          </button>

          <button 
            onClick={() => setShowConfirm(true)}
            className="flex flex-col items-center justify-center w-full text-gray-400 hover:text-red-500 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="text-xs mt-1 font-medium">Logout</span>
          </button>

        </div>
      </nav>

      {/* ── Logout Confirmation Modal ──────────────────────────────── */}
      {showConfirm && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          onClick={() => setShowConfirm(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]" />

          {/* Modal */}
          <div 
            className="relative w-full max-w-sm mx-4 mb-6 sm:mb-0 bg-white rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_200ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
                <span className="text-2xl">🚪</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Sign Out?</h3>
              <p className="text-sm text-gray-500 mt-1">
                You'll need to sign in again to access the dashboard.
              </p>
            </div>

            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loggingOut}
                className="flex-1 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {loggingOut ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    Signing out…
                  </span>
                ) : (
                  "Sign Out"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}