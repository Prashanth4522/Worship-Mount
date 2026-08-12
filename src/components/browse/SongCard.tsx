import Link from "next/link";

export interface SongCardProps {
  id: string;
  slug: string;
  titleEn: string;
  originalLanguage: string;
  originalKey: string;
  artists: { id: string; name: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
  variants?: { id: string; language: string; title: string }[];
  matchingSnippet?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  KN: "Kannada",
  TA: "Tamil",
  ML: "Malayalam",
  TE: "Telugu",
  HI: "Hindi",
  EN: "English",
};

export function SongCard({
  slug,
  titleEn,
  originalLanguage,
  originalKey,
  artists,
  categories,
  variants,
  matchingSnippet,
}: SongCardProps) {
  // Find native script variant if available
  const nativeVariant = variants?.find(
    (v) => v.language === originalLanguage
  );
  const displayTitle = nativeVariant?.title || titleEn;
  const showSecondaryTitle = nativeVariant && nativeVariant.title !== titleEn;

  return (
    <Link
      href={`/songs/${slug}`}
      className="group glass rounded-2xl p-5 hover:bg-[var(--color-surface-elevated)] transition-all duration-200 hover:shadow-md border border-[var(--color-border)] flex flex-col justify-between"
    >
      <div>
        {/* Header row: Language badge + Key badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/20">
            {LANGUAGE_NAMES[originalLanguage] || originalLanguage}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--color-secondary)] text-white font-bold">
            Key: {originalKey}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
          {displayTitle}
        </h3>
        {showSecondaryTitle && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {titleEn}
          </p>
        )}

        {/* Artist */}
        <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-1.5 line-clamp-1">
          {artists.length > 0
            ? artists.map((a) => a.name).join(", ")
            : "Unknown Artist"}
        </p>

        {/* Matching snippet (if from search) */}
        {matchingSnippet && (
          <p className="text-xs text-[var(--color-text-muted)] mt-3 italic line-clamp-2 bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border-subtle)]">
            "...{matchingSnippet}..."
          </p>
        )}
      </div>

      {/* Categories footer */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
          {categories.map((sc) => (
            <span
              key={sc.id}
              className="text-xs px-2 py-0.5 rounded-md bg-[var(--color-surface)] text-[var(--color-text-secondary)] font-medium border border-[var(--color-border-subtle)]"
            >
              {sc.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
