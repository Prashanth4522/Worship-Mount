import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { WorshipMountLogo } from "@/components/brand/Logo";

const LANGUAGE_LINKS = [
  { name: "Kannada", native: "ಕನ್ನಡ", href: "/languages/kannada" },
  { name: "Tamil", native: "தமிழ்", href: "/languages/tamil" },
  { name: "Telugu", native: "తెలుగు", href: "/languages/telugu" },
  { name: "Malayalam", native: "മലയാളം", href: "/languages/malayalam" },
  { name: "Hindi", native: "हिन्दी", href: "/languages/hindi" },
  { name: "English", native: "English", href: "/languages/english" },
];

export default function NotFound() {
  return (
    <div className="animate-fade-in min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Icon */}
      <div className="mb-6">
        <WorshipMountLogo size="lg" />
      </div>

      {/* Heading */}
      <h1 className="text-6xl font-black text-[var(--color-primary)] mb-4">
        404
      </h1>
      <p className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
        Page Not Found
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try searching for a song below, or browse by language.
      </p>

      {/* Search Bar */}
      <div className="w-full max-w-md mb-10">
        <SearchBar variant="hero" placeholder="Search songs, lyrics, artists..." />
      </div>

      {/* Language Quick Links */}
      <div className="w-full max-w-lg">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
          Browse by Language
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LANGUAGE_LINKS.map((lang) => (
            <Link
              key={lang.href}
              href={lang.href}
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center hover:scale-[1.03] transition-all duration-200 hover:shadow-md hover:border-[var(--color-accent)]"
            >
              <p className="text-lg font-black text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                {lang.native}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] font-bold">
                {lang.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Back Home Link */}
      <Link
        href="/"
        className="mt-10 px-6 py-3 rounded-xl bg-[var(--color-accent)] text-black font-bold text-sm hover:bg-amber-400 transition-colors shadow-md"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
