import { ArtistData, CategoryData } from "@/lib/types";

interface SongHeaderProps {
  title: string;
  titleEn: string;
  artists: ArtistData[];
  categories: CategoryData[];
  originalKey: string;
  displayKey: string;
  transposed: boolean;
}

export function SongHeader({
  title,
  titleEn,
  artists,
  categories,
  originalKey,
  displayKey,
  transposed,
}: SongHeaderProps) {
  const showOriginalTitle = title !== titleEn;

  return (
    <div className="mb-8 animate-slide-up">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight mb-1">
        {title}
      </h1>
      {showOriginalTitle && (
        <p className="text-lg text-[var(--color-text-secondary)] mb-3">
          {titleEn}
        </p>
      )}

      {/* Artist + Key row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Artists */}
        {artists.length > 0 && (
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-[var(--color-text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm text-[var(--color-text-secondary)]">
              {artists.map((a) => a.name).join(", ")}
            </span>
          </div>
        )}

        {/* Key badge */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-bold">
            Key: {displayKey}
          </span>
          {transposed && (
            <span className="text-xs text-[var(--color-text-muted)]">
              (original: {originalKey})
            </span>
          )}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-secondary-muted)] text-[var(--color-secondary)] font-medium"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
