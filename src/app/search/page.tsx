import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SearchResultsClient } from "./SearchResultsClient";

export const metadata = {
  title: "Search Worship Songs — WeWorship",
  description: "Search gospel song lyrics and chords in Kannada, Tamil, Malayalam, Telugu, Hindi, and English.",
};

export default async function SearchPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <Suspense
        fallback={
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-[var(--color-surface-hover)] rounded-xl w-64" />
            <div className="h-14 bg-[var(--color-surface-hover)] rounded-2xl w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-[var(--color-surface-hover)] rounded-xl" />
              ))}
            </div>
          </div>
        }
      >
        <SearchResultsClient categories={categories} />
      </Suspense>
    </div>
  );
}
