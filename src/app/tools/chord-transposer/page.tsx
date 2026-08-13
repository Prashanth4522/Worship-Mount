import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SongCard } from "@/components/browse/SongCard";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://worshipmount.com";

export const metadata: Metadata = {
  title: "Free Online Chord Transposer — Transpose Guitar & Keyboard Chords",
  description:
    "Instantly transpose guitar and keyboard chords for any worship song. Change key with one click, see chords update live above the lyrics. Free, fast, no signup required.",
  keywords: [
    "chord transposer",
    "transpose chords online",
    "guitar chord transposer",
    "keyboard chord transposer",
    "change key worship song",
    "worship chord transposer free",
  ],
  alternates: {
    canonical: `${BASE_URL}/tools/chord-transposer`,
  },
  openGraph: {
    title: "Free Chord Transposer Tool — Worship Mount",
    description:
      "Transpose guitar and keyboard chords instantly for any worship song. Change key, see chords update live. Free and fast.",
    url: `${BASE_URL}/tools/chord-transposer`,
    siteName: "Worship Mount",
  },
};

export default async function ChordTransposerPage() {
  // Fetch a few popular songs to link as examples
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
              { "@type": "ListItem", position: 3, name: "Chord Transposer", item: `${BASE_URL}/tools/chord-transposer` },
            ],
          }),
        }}
      />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] mb-3 block">
          Free Tool
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-6 text-[var(--color-text-primary)]">
          Chord{" "}
          <span className="text-[var(--color-accent)]">Transposer</span>
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
          Instantly change the key of any worship song. Our chord transposer
          updates every chord above the lyrics in real time — no manual
          recalculation, no errors. Just click <strong>+</strong> or{" "}
          <strong>−</strong> to move up or down by semitones.
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
              title: "Pick a Song",
              desc: "Browse our library of multilingual gospel songs — Kannada, Tamil, Telugu, Malayalam, Hindi, or English.",
            },
            {
              step: "2",
              title: "Transpose",
              desc: "Use the + and − buttons on the control bar to shift the key up or down by semitones. Every chord updates instantly.",
            },
            {
              step: "3",
              title: "Play or Export",
              desc: "Play directly from the screen, enter presentation mode for your projector, or download a PowerPoint slide deck.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-black font-black text-lg flex items-center justify-center mx-auto mb-4">
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
          Why Worship Leaders Use Our Transposer
        </h2>
        <ul className="space-y-4 text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-accent)] font-bold text-lg mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text-primary)]">Live preview</strong> — chords update above lyrics in real time as you transpose, so you can see the result before committing.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-accent)] font-bold text-lg mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text-primary)]">Sharps and flats handled automatically</strong> — the transposer knows the musical context and picks the correct enharmonic spelling (e.g., F# vs Gb).</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-accent)] font-bold text-lg mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text-primary)]">Works with all 6 languages</strong> — Kannada, Tamil, Telugu, Malayalam, Hindi, English. Chords are always in standard Western notation.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-accent)] font-bold text-lg mt-0.5">✓</span>
            <span><strong className="text-[var(--color-text-primary)]">No signup, completely free</strong> — just open a song and start transposing.</span>
          </li>
        </ul>
      </section>

      {/* Try It — Song Examples */}
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
