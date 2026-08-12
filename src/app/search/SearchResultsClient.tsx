"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterBar } from "@/components/browse/FilterBar";
import { SongCard, SongCardProps } from "@/components/browse/SongCard";

interface SearchResultsClientProps {
  categories: { id: string; name: string; slug: string }[];
}

export function SearchResultsClient({ categories }: SearchResultsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const initialLang = searchParams.get("language") || "";
  const initialCat = searchParams.get("category") || "";
  const initialSort = searchParams.get("sort") || "recent";

  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState(initialSort);
  const [songs, setSongs] = useState<SongCardProps[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize URL search params
  const updateURL = useCallback(
    (lang: string, cat: string, sort: string) => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (lang) params.set("language", lang);
      if (cat) params.set("category", cat);
      if (sort && sort !== "recent") params.set("sort", sort);
      router.push(`/search?${params.toString()}`);
    },
    [query, router]
  );

  // Fetch results when search params or filters change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedLanguage) params.set("language", selectedLanguage);
    if (selectedCategory) params.set("category", selectedCategory);
    if (sortBy) params.set("sort", sortBy);

    fetch(`/api/songs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setSongs(data.songs || []);
          setTotal(data.pagination?.total || 0);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Search failed:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query, selectedLanguage, selectedCategory, sortBy]);

  return (
    <div>
      {/* Title & Search bar */}
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
          {query ? `Search Results for "${query}"` : "All Song Lyrics & Chords"}
        </h1>
        <SearchBar variant="compact" initialValue={query} />
      </div>

      {/* Filter Bar */}
      <FilterBar
        selectedLanguage={selectedLanguage}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        categories={categories}
        onLanguageChange={(lang) => {
          setSelectedLanguage(lang);
          updateURL(lang, selectedCategory, sortBy);
        }}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat);
          updateURL(selectedLanguage, cat, sortBy);
        }}
        onSortChange={(sort) => {
          setSortBy(sort);
          updateURL(selectedLanguage, selectedCategory, sort);
        }}
      />

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
        <span>
          Showing <strong className="text-[var(--color-text-primary)]">{total}</strong> {total === 1 ? "song" : "songs"}
        </span>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass rounded-xl p-5 h-44 animate-pulse bg-[var(--color-surface-hover)]"
            />
          ))}
        </div>
      ) : songs.length === 0 ? (
        /* Empty state */
        <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            ?
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            No songs found
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            We couldn't find any songs matching your search criteria. Try adjusting your search query or filters.
          </p>
          <button
            onClick={() => {
              setSelectedLanguage("");
              setSelectedCategory("");
              router.push("/search");
            }}
            className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-black font-semibold text-xs hover:bg-amber-400 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Results grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
            <SongCard key={song.id} {...song} />
          ))}
        </div>
      )}
    </div>
  );
}
