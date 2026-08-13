"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function AdminNavControls() {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex items-center gap-2 ml-2">
      <Link
        href="/admin/songs"
        className="px-3 py-1.5 text-xs font-bold bg-[#F05A28] text-white hover:bg-[#d94e20] rounded-xl transition-colors whitespace-nowrap shadow-sm"
      >
        Admin Panel
      </Link>
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 text-xs font-bold bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-red-500 hover:border-red-500/50 rounded-xl transition-colors whitespace-nowrap"
      >
        Logout
      </button>
    </div>
  );
}
