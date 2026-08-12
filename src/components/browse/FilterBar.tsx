"use client";

interface FilterBarProps {
  selectedLanguage: string;
  selectedCategory: string;
  sortBy: string;
  categories: { id: string; name: string; slug: string }[];
  onLanguageChange: (lang: string) => void;
  onCategoryChange: (cat: string) => void;
  onSortChange: (sort: string) => void;
}

const LANGUAGES = [
  { code: "", label: "All Languages" },
  { code: "KN", label: "Kannada" },
  { code: "TA", label: "Tamil" },
  { code: "TE", label: "Telugu" },
  { code: "ML", label: "Malayalam" },
  { code: "HI", label: "Hindi" },
  { code: "EN", label: "English" },
];

export function FilterBar({
  selectedLanguage,
  selectedCategory,
  sortBy,
  categories,
  onLanguageChange,
  onCategoryChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="glass rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
      {/* Language filter pills */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              selectedLanguage === lang.code
                ? "bg-[var(--color-accent)] text-black font-bold shadow-md shadow-amber-500/20"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)]"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Category & Sort Dropdowns */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Category dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-[var(--color-surface)] text-[var(--color-text-primary)] text-xs font-medium px-3 py-2 rounded-xl border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-[var(--color-surface)] text-[var(--color-text-primary)] text-xs font-medium px-3 py-2 rounded-xl border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
        >
          <option value="recent">Recently Added</option>
          <option value="title">Alphabetical (A-Z)</option>
        </select>
      </div>
    </div>
  );
}
