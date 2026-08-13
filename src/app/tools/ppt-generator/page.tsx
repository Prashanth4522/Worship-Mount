import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SongCard } from "@/components/browse/SongCard";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://worshipmount.com";

export const metadata: Metadata = {
  title: "Worship Song PPT Generator — Free Church Presentation Slides",
  description:
    "Generate beautiful PowerPoint presentation slides from any worship song in seconds. Export lyrics in native script or dual-language format. Free for churches and worship teams.",
  keywords: [
    "worship song ppt generator",
    "church presentation slide maker",
    "worship powerpoint slides",
    "church lyrics ppt",
    "gospel song presentation",
    "free church ppt maker",
  ],
  alternates: {
    canonical: `${BASE_URL}/tools/ppt-generator`,
  },
  openGraph: {
    title: "Free Worship Song PPT Generator — Worship Mount",
    description:
      "Generate presentation slides for any worship song. Export to PowerPoint with one click. Free for churches.",
    url: `${BASE_URL}/tools/ppt-generator`,
    siteName: "Worship Mount",
  },
};

export default async function PptGeneratorPage() {
  const exampleSongs = await prisma.song.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: {
      variants: true,
      songArtists: { include: { artist: true } },
      songCategories: { include: { category: true } },
    },
  });

  return (
    <div className="animate-fade-in">
      {/* BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Tools", item: `${BASE_URL}/tools` },
              { "@type": "ListItem", position: 3, name: "PPT Generator", item: `${BASE_URL}/tools/ppt-generator` },
            ],
          }),
        }}
      />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] mb-3 block">
          Free Tool
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-6 text-[var(--color-text-primary)]">
          Worship Song{" "}
          <span className="text-[var(--color-secondary)]">PPT Generator</span>
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
          Stop manually building PowerPoint slides for your church service.
          Worship Mount generates clean, readable presentation slides from any
          song in our library — in seconds, with one click.
        </p>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-8 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Find Your Song",
              desc: "Search or browse our library of multilingual gospel songs across 6 Indian languages and English.",
            },
            {
              step: "2",
              title: "Choose Export Mode",
              desc: "Pick from lyrics-only, primary script, or dual-language slides — perfect for multilingual congregations.",
            },
            {
              step: "3",
              title: "Download .PPTX",
              desc: "Click the download button and get a ready-to-use PowerPoint file. Open it, plug in your projector, and worship.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-[var(--color-text-primary)] mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
          Built for Churches
        </h2>
        <ul className="space-y-4 text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-secondary)] font-bold text-lg mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text-primary)]">Clean, readable slides</strong> — large text, dark background, no clutter. Optimized for projectors and screens of all sizes.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-secondary)] font-bold text-lg mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text-primary)]">Dual-language support</strong> — show native script and English transliteration side by side for multilingual congregations.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-secondary)] font-bold text-lg mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text-primary)]">Standard .PPTX format</strong> — opens in PowerPoint, Google Slides, LibreOffice, Keynote — anything your church uses.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-secondary)] font-bold text-lg mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text-primary)]">Completely free</strong> — no signup, no watermarks, no limits. Built to serve the church.</span>
          </li>
        </ul>
      </section>

      {/* Try It */}
      {exampleSongs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
            Try It on a Song
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exampleSongs.map((song) => (
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
        </section>
      )}
    </div>
  );
}
