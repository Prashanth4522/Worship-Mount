import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SongForm } from "@/components/admin/SongForm";
import { Token, ScriptMode } from "@/lib/types";
import Link from "next/link";

export const metadata = {
  title: "Edit Song — Admin | WeWorship",
};

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

function tokensToChordProLine(tokens: Token[]): string {
  return tokens
    .map((t) => (t.chord ? `[${t.chord}]${t.text}` : t.text))
    .join("");
}

export default async function EditSongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const song = await prisma.song.findUnique({
    where: { id },
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
      songArtists: true,
      songCategories: true,
    },
  });

  if (!song) {
    notFound();
  }

  // Reconstruct ChordPro text for each variant
  const formattedVariants = song.variants.map((v) => {
    const chordProText = v.sections
      .map((sec) => {
        const linesText = sec.lines
          .map((l) => tokensToChordProLine(parseTokens(l.tokens)))
          .join("\n");
        return `[${sec.label}]\n${linesText}`;
      })
      .join("\n\n");

    return {
      id: v.id,
      language: v.language as ScriptMode,
      title: v.title,
      isPrimary: v.isPrimary,
      chordProText,
    };
  });

  const initialData = {
    id: song.id,
    titleEn: song.titleEn,
    originalLanguage: song.originalLanguage as ScriptMode,
    originalKey: song.originalKey,
    ccliOrSource: song.ccliOrSource,
    status: song.status as "DRAFT" | "PUBLISHED",
    tags: song.tags,
    artistIds: song.songArtists.map((sa) => sa.artistId),
    categoryIds: song.songCategories.map((sc) => sc.categoryId),
    variants: formattedVariants,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/songs"
          className="text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          ← Back to Song Management
        </Link>
      </div>

      <h1 className="text-3xl font-black text-[var(--color-primary)] mb-8">
        Edit Worship Song: <span className="text-[var(--color-accent)]">{song.titleEn}</span>
      </h1>

      <SongForm initialData={initialData} isEditing={true} />
    </div>
  );
}
