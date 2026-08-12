import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { SongCard } from "@/components/browse/SongCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Worship Mount — Gospel Lyrics & Chords",
  description:
    "Discover multilingual gospel lyrics and chords in Kannada, Tamil, Telugu, Malayalam, Hindi, and English with auto-transpose, presentation mode, and slide generation.",
};

const LANGUAGES = [
  { code: "KN", name: "Kannada", native: "ಕನ್ನಡ", href: "/languages/kannada" },
  { code: "TA", name: "Tamil", native: "தமிழ்", href: "/languages/tamil" },
  { code: "TE", name: "Telugu", native: "తెలుగు", href: "/languages/telugu" },
  { code: "ML", name: "Malayalam", native: "മലയാളം", href: "/languages/malayalam" },
  { code: "HI", name: "Hindi", native: "हिन्दी", href: "/languages/hindi" },
  { code: "EN", name: "English", native: "English", href: "/languages/english" },
];

export default async function HomePage() {
  const recentSongs = await prisma.song.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: {
      variants: true,
      songArtists: {
        include: { artist: true },
      },
      songCategories: {
        include: { category: true },
      },
    },
  });

  return (
    <div className="animate-fade-in">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              <span className="text-[var(--color-primary)]">Gospel Lyrics</span>
              <br />
              <span className="text-[var(--color-accent)]">
                & Chords
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] mb-10 leading-relaxed font-medium">
              Worship songs in Kannada, Tamil, Telugu, Malayalam, Hindi & English.
              <br className="hidden sm:block" />
              Transpose chords, enter presentation mode, and download PowerPoint slides.
            </p>

            {/* Live Search Bar Component */}
            <SearchBar variant="hero" />
          </div>
        </div>
      </section>

      {/* ── Browse by Language ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">
          Browse by Language
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {LANGUAGES.map((lang) => (
            <Link
              key={lang.code}
              href={lang.href}
              className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center hover:scale-[1.03] transition-all duration-200 hover:shadow-md hover:border-[var(--color-accent)]"
            >
              <p className="text-2xl font-black mb-1 text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                {lang.native}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] font-bold">
                {lang.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent Songs ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">
          Recently Added
        </h2>
        {recentSongs.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">No songs published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSongs.map((song) => (
              <SongCard
                key={song.id}
                id={song.id}
                slug={song.slug}
                titleEn={song.titleEn}
                originalLanguage={song.originalLanguage}
                originalKey={song.originalKey}
                artists={song.songArtists.map((sa) => sa.artist)}
                categories={song.songCategories.map((sc) => sc.category)}
                variants={song.variants}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
