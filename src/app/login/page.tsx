"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorshipMountLogo } from "@/components/brand/Logo";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Redirect to admin panel on success
        router.push("/admin/songs");
        router.refresh(); // Ensure the layout refreshes to show the admin button
      } else {
        const data = await res.json();
        setError(data.error || "Failed to login. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <WorshipMountLogo size="lg" />
          <h1 className="text-2xl font-bold mt-6 text-[var(--color-text)]">Admin Login</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Sign in to access the management dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F05A28] focus:border-transparent transition-all text-[var(--color-text)]"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F05A28] focus:border-transparent transition-all text-[var(--color-text)]"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#F05A28] text-white font-bold rounded-xl hover:bg-[#d94e20] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F05A28] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
