import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { SongViewer } from "@/components/song/SongViewer";
import { SongData, VariantData, SectionData, LineData, Token } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://weworship.org";

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

  return (
    <>
      {/* Structured data for Google Lyrics Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SongViewer song={songData} />
    </>
  );
}
