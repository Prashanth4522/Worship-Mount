"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResultItem {
  id: string;
  slug: string;
  titleEn: string;
  originalLanguage: string;
  originalKey: string;
  artists: { name: string }[];
  variants?: { language: string; title: string }[];
}

interface SearchBarProps {
  variant?: "hero" | "compact";
  initialValue?: string;
  placeholder?: string;
}

export function SearchBar({
  variant = "hero",
  initialValue = "",
  placeholder = "Search songs, artists, or lyrics...",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search fetch
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/songs?q=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.songs || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim() || val.length < 2) {
      setResults([]);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        setIsOpen(false);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  const isHero = variant === "hero";

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`glass rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 ${
            isHero ? "p-1 sm:p-1.5" : "p-1"
          } ${isOpen && results.length > 0 ? "ring-2 ring-[var(--color-accent)]" : ""}`}
        >
          <div className="flex items-center px-3.5 py-2 sm:py-2.5">
            {/* Search Icon */}
            <svg
              className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {/* Search Input */}
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
              placeholder={placeholder}
              className={`w-full bg-transparent border-none outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] ml-3 ${
                isHero ? "text-base" : "text-sm"
              }`}
              id={isHero ? "hero-search-input" : "nav-search-input"}
            />

            {/* Loading Spinner / Clear button */}
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setIsOpen(false);
                }}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1"
              >
                ✕
              </button>
            ) : null}

            {/* Submit button */}
            <button
              type="submit"
              className="ml-2 px-3 py-1.5 rounded-xl bg-[var(--color-accent)] text-black font-semibold text-xs hover:bg-amber-400 transition-colors flex-shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl p-2 shadow-2xl z-50 border border-[var(--color-border)] animate-fade-in max-h-80 overflow-y-auto">
          <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-3 py-1.5">
            Matching Songs
          </div>
          {results.map((song) => {
            const nativeTitle = song.variants?.find(
              (v) => v.language === song.originalLanguage
            )?.title;

            return (
              <Link
                key={song.id}
                href={`/songs/${song.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors group"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                    {nativeTitle || song.titleEn}
                  </p>
                  {nativeTitle && nativeTitle !== song.titleEn && (
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {song.titleEn}
                    </p>
                  )}
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {song.artists.map((a) => a.name).join(", ") || "Unknown Artist"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-bold">
                    {song.originalKey}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                    {song.originalLanguage}
                  </span>
                </div>
              </Link>
            );
          })}

          <Link
            href={`/search?q=${encodeURIComponent(query.trim())}`}
            onClick={() => setIsOpen(false)}
            className="block text-center py-2.5 text-xs font-medium text-[var(--color-accent)] hover:underline border-t border-[var(--color-border-subtle)] mt-1"
          >
            See all results for &quot;{query}&quot; →
          </Link>
        </div>
      )}
    </div>
  );
}
