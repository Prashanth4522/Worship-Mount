import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminSongTable } from "@/components/admin/AdminSongTable";

export const metadata = {
  title: "Song Management — Admin | WeWorship",
};

export default async function AdminSongsPage() {
  const songs = await prisma.song.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      variants: true,
      songArtists: {
        include: { artist: true },
      },
    },
  });

  const formattedSongs = songs.map((s) => ({
    id: s.id,
    slug: s.slug,
    titleEn: s.titleEn,
    originalLanguage: s.originalLanguage,
    originalKey: s.originalKey,
    status: s.status as "DRAFT" | "PUBLISHED",
    updatedAt: s.updatedAt.toISOString(),
    artists: s.songArtists.map((sa) => sa.artist.name).join(", ") || "Traditional",
    variantCount: s.variants.length,
    nativeTitle: s.variants.find((v) => v.isPrimary)?.title || s.titleEn,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-primary)]">
            Song Management
          </h1>
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-1">
            Create, edit, publish, and manage worship song lyrics and chord charts.
          </p>
        </div>

        <Link
          href="/admin/songs/new"
          className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-extrabold hover:bg-[var(--color-accent-hover)] transition-all shadow-md shadow-red-500/10 flex items-center gap-2"
        >
          <span>+ Add New Song</span>
        </Link>
      </div>

      {/* Admin Songs Client Table */}
      <AdminSongTable songs={formattedSongs} />
    </div>
  );
}
