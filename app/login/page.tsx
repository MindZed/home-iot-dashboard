// app/login/page.tsx
// Login page — mobile-first, matching the dashboard design language.
// Submits credentials to /api/auth/login and redirects to dashboard on success.

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-950 px-6 transition-colors duration-300">
      <motion.div 
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 24 }}
      >
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 dark:from-red-600 dark:to-red-800 shadow-lg shadow-blue-200/50 dark:shadow-red-900/30 mb-5 transition-colors duration-300">
            <span className="text-3xl">🏠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Home IoT</h1>
          <p className="text-sm text-gray-400 dark:text-neutral-500 mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-red-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-red-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20"
            >
              <span className="text-sm">⚠️</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 dark:from-red-600 dark:to-red-700 text-white font-semibold text-sm shadow-lg shadow-blue-200/40 dark:shadow-red-900/30 hover:shadow-xl hover:shadow-blue-300/40 dark:hover:shadow-red-900/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-gray-300 dark:text-neutral-600 mt-8 transition-colors duration-300">
          🔒 Secured with encrypted session tokens
        </p>
      </motion.div>
    </div>
  );
}
