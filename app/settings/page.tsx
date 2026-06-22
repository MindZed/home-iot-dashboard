"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeProvider";
import BottomNav from "@/components/BottomNav";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 5) {
      setPasswordError("Password must be at least 5 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Failed to update password");
      }
    } catch {
      setPasswordError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      console.error("Logout failed");
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 font-sans transition-colors duration-300">
      <main className="flex-1 overflow-y-auto p-5 pb-24">
        <motion.div 
          className="max-w-md mx-auto space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <header className="pt-3 pb-1">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="mt-0.5 text-sm font-medium text-gray-500 dark:text-neutral-400">
              Manage your preferences and security
            </p>
          </header>

          {/* Appearance Section */}
          <section className="bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{theme === "dark" ? "🌙" : "☀️"}</span>
                <span className="font-medium">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                  theme === "dark" ? "bg-red-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                    theme === "dark" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
              Security
            </h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500/80 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500/80 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500/80 transition-shadow"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-500 font-medium">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-500 font-medium">{passwordSuccess}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-gray-900 dark:bg-neutral-800 hover:bg-black dark:hover:bg-neutral-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>

          {/* Logout Section */}
          <section className="pt-4 pb-2">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 font-semibold text-sm border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <span>🚪</span> Sign Out
            </button>
          </section>

        </motion.div>
      </main>

      <BottomNav />

      {/* ── Logout Confirmation Modal ──────────────────────────────── */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]" />
          <div 
            className="relative w-full max-w-sm mx-4 mb-6 sm:mb-0 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_200ms_ease-out] border border-gray-100 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 mb-4">
                <span className="text-2xl">🚪</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sign Out?</h3>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                You'll need to sign in again to access the dashboard.
              </p>
            </div>

            <div className="flex border-t border-gray-100 dark:border-neutral-800">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="flex-1 py-3.5 text-sm font-semibold text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors border-r border-gray-100 dark:border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 py-3.5 text-sm font-semibold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {loggingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
