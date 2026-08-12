import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { SongCard } from "@/components/browse/SongCard";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://weworship.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await prisma.artist.findUnique({
    where: { slug },
  });

  if (!artist) return { title: "Artist Not Found" };

  const canonicalUrl = `${BASE_URL}/artists/${slug}`;
  const title = `${artist.name} — Worship Songs, Lyrics & Chords`;
  const description = `Browse all gospel worship songs, lyrics, and chord charts by ${artist.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Worship Mount",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const artist = await prisma.artist.findUnique({
    where: { slug },
    include: {
      songArtists: {
        include: {
          song: {
            include: {
              variants: true,
              songArtists: { include: { artist: true } },
              songCategories: { include: { category: true } },
            },
          },
        },
      },
    },
  });

  if (!artist) {
    notFound();
  }

  const songs = artist.songArtists.map((sa) => sa.song);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Artist Banner ── */}
      <div className="glass rounded-3xl p-8 mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-secondary)] to-purple-800 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {artist.name.charAt(0)}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)]">
              Artist / Composer
            </span>
            <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)]">
              {artist.name}
            </h1>
          </div>
        </div>
        {artist.bio && (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
            {artist.bio}
          </p>
        )}
      </div>

      {/* ── Song List ── */}
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
        Songs by {artist.name} ({songs.length})
      </h2>

      {songs.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No songs found for this artist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
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
    </div>
  );
}
