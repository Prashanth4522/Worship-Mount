import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { SongCard } from "@/components/browse/SongCard";
import Link from "next/link";

interface LanguageConfig {
  code: string;
  name: string;
  native: string;
  description: string;
  gradient: string;
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  kannada: {
    code: "KN",
    name: "Kannada",
    native: "ಕನ್ನಡ",
    description: "Browse Kannada gospel song lyrics and chords. Transpose keys, read native script & Eng-Kannada transliteration, and download PowerPoint decks.",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  tamil: {
    code: "TA",
    name: "Tamil",
    native: "தமிழ்",
    description: "Browse Tamil Christian song lyrics and chords. Read native script & Tanglish transliteration, transpose keys, and download PowerPoint decks.",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  telugu: {
    code: "TE",
    name: "Telugu",
    native: "తెలుగు",
    description: "Browse Telugu gospel song lyrics and chords. Read native script & Eng-Telugu transliteration, transpose keys, and download PowerPoint decks.",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
  malayalam: {
    code: "ML",
    name: "Malayalam",
    native: "മലയാളം",
    description: "Browse Malayalam Christian song lyrics and chords. Read native script & Eng-Malayalam transliteration, transpose keys, and download PowerPoint decks.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  hindi: {
    code: "HI",
    name: "Hindi",
    native: "हिन्दी",
    description: "Browse Hindi gospel song lyrics and chords in Eng-Hindi transliteration. Transpose keys, enter presentation mode, and download PowerPoint decks.",
    gradient: "from-amber-500/20 to-yellow-500/20",
  },
  english: {
    code: "EN",
    name: "English",
    native: "English",
    description: "Browse English worship song lyrics and chords. Transpose keys, enter presentation mode, and download PowerPoint decks.",
    gradient: "from-cyan-500/20 to-sky-500/20",
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://worshipmount.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ language: string }>;
}): Promise<Metadata> {
  const { language } = await params;
  const config = LANGUAGE_CONFIGS[language.toLowerCase()];
  if (!config) return { title: "Language Not Found" };

  const canonicalUrl = `${BASE_URL}/languages/${language.toLowerCase()}`;
  const title = `${config.name} (${config.native}) Gospel Song Lyrics & Chords`;

  return {
    title,
    description: config.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: config.description,
      url: canonicalUrl,
      siteName: "Worship Mount",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: config.description,
    },
  };
}

export default async function LanguagePage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const config = LANGUAGE_CONFIGS[language.toLowerCase()];

  if (!config) {
    notFound();
  }

  const songs = await prisma.song.findMany({
    where: {
      originalLanguage: config.code,
      status: "PUBLISHED",
    },
    orderBy: { updatedAt: "desc" },
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
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Hero Banner ── */}
      <div className={`glass rounded-3xl p-8 sm:p-12 mb-10 bg-gradient-to-br ${config.gradient} relative overflow-hidden`}>
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] mb-2 block">
            Language Catalog
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-text-primary)] mb-2">
            {config.native}{" "}
            <span className="text-2xl font-normal text-[var(--color-text-secondary)]">
              ({config.name})
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed mb-6">
            {config.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span>
              <strong className="text-[var(--color-text-primary)]">{songs.length}</strong>{" "}
              {songs.length === 1 ? "song available" : "songs available"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Song List ── */}
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
        All {config.name} Songs
      </h2>

      {songs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto my-8">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            No {config.name} songs added yet.
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-black font-semibold text-xs hover:bg-amber-400 transition-colors inline-block"
          >
            Back to Home
          </Link>
        </div>
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
