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
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) return { title: "Category Not Found" };

  const canonicalUrl = `${BASE_URL}/categories/${slug}`;
  const title = `${category.name} Worship Songs — Lyrics & Chords`;
  const description = `Browse all gospel worship songs, lyrics, and chord charts under the category ${category.name}.`;

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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      songCategories: {
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

  if (!category) {
    notFound();
  }

  const songs = category.songCategories.map((sc) => sc.song);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Category Banner ── */}
      <div className="glass rounded-3xl p-8 mb-10 border border-[var(--color-secondary-muted)] bg-[var(--color-secondary-muted)]/20">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] mb-1 block">
          Category
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)]">
          {category.name} Songs
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          Showing {songs.length} {songs.length === 1 ? "song" : "songs"} in this category
        </p>
      </div>

      {/* ── Song List ── */}
      {songs.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No songs found in this category.</p>
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
