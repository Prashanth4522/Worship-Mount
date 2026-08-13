import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { Metadata } from "next";
import Link from "next/link";
import { SongViewer } from "@/components/song/SongViewer";
import { SongCard } from "@/components/browse/SongCard";
import { SongData, VariantData, SectionData, LineData, Token } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://worshipmount.com";

const LANGUAGE_CODE_TO_NAME: Record<string, string> = {
  KN: "Kannada", TA: "Tamil", TE: "Telugu", ML: "Malayalam", HI: "Hindi", EN: "English",
};
const LANGUAGE_CODE_TO_SLUG: Record<string, string> = {
  KN: "kannada", TA: "tamil", TE: "telugu", ML: "malayalam", HI: "hindi", EN: "english",
};

// ── Helper to parse tokens from DB storage ──
function parseTokens(tokensRaw: string | Token[]): Token[] {
  if (typeof tokensRaw === "string") {
    try {
      return JSON.parse(tokensRaw);
    } catch {
      return [{ text: tokensRaw, chord: null }];
    }
  }
  return tokensRaw;
}

// ── Generate metadata for SEO ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const song = await prisma.song.findUnique({
    where: { slug },
    include: {
      variants: true,
      songArtists: { include: { artist: true } },
    },
  });

  if (!song) return { title: "Song Not Found" };

  const primaryVariant =
    song.variants.find((v) => v.isPrimary) || song.variants[0];
  const nativeTitle = primaryVariant?.title;
  const titleDisplay =
    nativeTitle && nativeTitle !== song.titleEn
      ? `${nativeTitle} (${song.titleEn})`
      : song.titleEn;

  const artists =
    song.songArtists.map((sa) => sa.artist.name).join(", ") || "Traditional";

  const description = `${titleDisplay} by ${artists} — Gospel song lyrics and worship chords in original key ${song.originalKey}. Transpose key, enter presentation mode, and download PowerPoint slides.`;

  const canonicalUrl = `${BASE_URL}/songs/${slug}`;

  return {
    title: `${titleDisplay} — Lyrics & Chords`,
    description,
    keywords: [
      song.titleEn,
      nativeTitle,
      artists,
      "lyrics",
      "chords",
      "gospel",
      "worship",
      song.originalLanguage,
    ].filter(Boolean) as string[],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${titleDisplay} — Gospel Lyrics & Chords`,
      description,
      url: canonicalUrl,
      siteName: "Worship Mount",
      type: "article",
      publishedTime: song.createdAt.toISOString(),
      modifiedTime: song.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: `${titleDisplay} — Lyrics & Chords`,
      description,
    },
  };
}

// ── Song page (SSR) ──
export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const song = await prisma.song.findUnique({
    where: { slug },
    include: {
      variants: {
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: {
              lines: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
      songArtists: {
        include: { artist: true },
      },
      songCategories: {
        include: { category: true },
      },
    },
  });

  if (!song) {
    notFound();
  }

  // Transform DB data into SongData
  const songData: SongData = {
    id: song.id,
    slug: song.slug,
    titleEn: song.titleEn,
    originalLanguage: song.originalLanguage as SongData["originalLanguage"],
    originalKey: song.originalKey,
    ccliOrSource: song.ccliOrSource,
    status: song.status as SongData["status"],
    tags: song.tags ? song.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    createdAt: song.createdAt.toISOString(),
    updatedAt: song.updatedAt.toISOString(),
    variants: song.variants.map(
      (v): VariantData => ({
        id: v.id,
        songId: v.songId,
        language: v.language as VariantData["language"],
        title: v.title,
        isPrimary: v.isPrimary,
        sections: v.sections.map(
          (s): SectionData => ({
            id: s.id,
            variantId: s.variantId,
            order: s.order,
            type: s.type as SectionData["type"],
            label: s.label,
            lines: s.lines.map(
              (l): LineData => ({
                id: l.id,
                sectionId: l.sectionId,
                order: l.order,
                tokens: parseTokens(l.tokens),
              })
            ),
          })
        ),
      })
    ),
    artists: song.songArtists.map((sa) => ({
      id: sa.artist.id,
      name: sa.artist.name,
      slug: sa.artist.slug,
      bio: sa.artist.bio,
      image: sa.artist.image,
    })),
    categories: song.songCategories.map((sc) => ({
      id: sc.category.id,
      name: sc.category.name,
      slug: sc.category.slug,
    })),
  };

  // Extract plain-text lyrics for Schema.org JSON-LD
  const primaryVariant =
    songData.variants.find((v) => v.isPrimary) || songData.variants[0];

  const lyricsPlainText = primaryVariant
    ? primaryVariant.sections
        .map(
          (sec) =>
            `[${sec.label}]\n` +
            sec.lines
              .map((line) => line.tokens.map((t) => t.text).join(""))
              .join("\n")
        )
        .join("\n\n")
    : "";

  // Schema.org structured data (MusicComposition)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    name: song.titleEn,
    alternateName: primaryVariant?.title !== song.titleEn ? primaryVariant?.title : undefined,
    composer: song.songArtists.map((sa) => ({
      "@type": "Person",
      name: sa.artist.name,
    })),
    musicalKey: song.originalKey,
    inLanguage: song.originalLanguage.toLowerCase(),
    lyrics: {
      "@type": "Lyrics",
      text: lyricsPlainText,
    },
    genre: song.songCategories.map((sc) => sc.category.name),
    url: `${BASE_URL}/songs/${slug}`,
  };

  // BreadcrumbList schema (Home > Language > Song)
  const langName = LANGUAGE_CODE_TO_NAME[song.originalLanguage] || song.originalLanguage;
  const langSlug = LANGUAGE_CODE_TO_SLUG[song.originalLanguage] || song.originalLanguage.toLowerCase();
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${langName} Songs`,
        item: `${BASE_URL}/languages/${langSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: primaryVariant?.title || song.titleEn,
        item: `${BASE_URL}/songs/${slug}`,
      },
    ],
  };

  // Fetch related songs (same language, excluding current song)
  const relatedSongs = await prisma.song.findMany({
    where: {
      originalLanguage: song.originalLanguage,
      status: "PUBLISHED",
      id: { not: song.id },
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: {
      variants: true,
      songArtists: { include: { artist: true } },
      songCategories: { include: { category: true } },
    },
  });

  return (
    <>
      {/* Structured data for Google Lyrics Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SongViewer song={songData} />

      {/* Related Songs — Internal Linking */}
      {relatedSongs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="border-t border-[var(--color-border-subtle)] pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                More {langName} Songs
              </h2>
              <Link
                href={`/languages/${langSlug}`}
                className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedSongs.map((rs) => (
                <SongCard
                  key={rs.id}
                  id={rs.id}
                  slug={rs.slug}
                  titleEn={rs.titleEn}
                  originalLanguage={rs.originalLanguage}
                  originalKey={rs.originalKey}
                  artists={rs.songArtists.map((sa) => sa.artist)}
                  categories={rs.songCategories.map((sc) => sc.category)}
                  variants={rs.variants}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
