"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface AdminSongItem {
  id: string;
  slug: string;
  titleEn: string;
  originalLanguage: string;
  originalKey: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
  artists: string;
  variantCount: number;
  nativeTitle: string;
}

interface AdminSongTableProps {
  songs: AdminSongItem[];
}

export function AdminSongTable({ songs: initialSongs }: AdminSongTableProps) {
  const router = useRouter();
  const [songs, setSongs] = useState<AdminSongItem[]>(initialSongs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter songs
  const filteredSongs = songs.filter((s) => {
    const matchesSearch =
      s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nativeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artists.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Toggle status handler
  const handleToggleStatus = async (id: string, currentStatus: "DRAFT" | "PUBLISHED") => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/songs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setSongs((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
        );
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Delete song handler
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/songs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete song:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter songs by title, native script, or artist..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-medium outline-none focus:border-[var(--color-accent)] w-full"
        />

        <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)] self-stretch sm:self-auto">
          {(["ALL", "PUBLISHED", "DRAFT"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === st
                  ? "bg-[var(--color-secondary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Songs Table ── */}
      <div className="glass rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[10px] uppercase font-black tracking-wider text-[var(--color-text-muted)]">
                <th className="py-3.5 px-4">Title & Language</th>
                <th className="py-3.5 px-4">Artist</th>
                <th className="py-3.5 px-4">Key</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Variants</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)] text-xs">
              {filteredSongs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--color-text-muted)]">
                    No songs found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredSongs.map((song) => (
                  <tr
                    key={song.id}
                    className="hover:bg-[var(--color-surface-elevated)] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/songs/${song.slug}`}
                        className="font-bold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors block"
                      >
                        {song.nativeTitle}
                      </Link>
                      {song.nativeTitle !== song.titleEn && (
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {song.titleEn}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-text-secondary)] font-medium">
                      {song.artists}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                        {song.originalKey}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(song.id, song.status)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                          song.status === "PUBLISHED"
                            ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                        }`}
                        title="Click to toggle status"
                      >
                        {song.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-text-secondary)] font-semibold">
                      {song.variantCount} scripts
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/songs/${song.id}/edit`}
                        className="px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold hover:border-[var(--color-accent)] transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(song.id, song.titleEn)}
                        disabled={deletingId === song.id}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 font-bold hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                      >
                        {deletingId === song.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
