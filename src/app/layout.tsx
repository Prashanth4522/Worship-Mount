import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { WorshipMountLogo } from "@/components/brand/Logo";
import { cookies } from "next/headers";
import { AdminNavControls } from "@/components/admin/AdminNavControls";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://worshipmount.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Worship Mount — Gospel Lyrics & Chords",
    template: "%s | Worship Mount",
  },
  description:
    "Multilingual Gospel lyrics, chords, transposers, and PowerPoint slide deck generator for worship leaders and church teams.",
  keywords: [
    "gospel lyrics",
    "worship chords",
    "kannada christian songs",
    "tamil christian songs",
    "telugu christian lyrics",
    "malayalam worship",
    "hindi worship songs",
    "church ppt generator",
    "transpose chords",
    "worship mount",
  ],
  authors: [{ name: "Worship Mount" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Worship Mount",
    title: "Worship Mount — Gospel Lyrics & Chords",
    description:
      "Multilingual Gospel lyrics, chords, transposers, and PowerPoint slide deck generator for worship leaders and church teams.",
  },
};

// Sitewide structured data (Organization + WebSite with SearchAction)
const sitewideSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Worship Mount",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    sameAs: [],
    description:
      "Multilingual gospel lyrics, chords, transposer, and PowerPoint slide generator for worship leaders and churches.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Worship Mount",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
];

const NAV_LANGUAGES = [
  { label: "Kannada", href: "/languages/kannada" },
  { label: "Tamil", href: "/languages/tamil" },
  { label: "Telugu", href: "/languages/telugu" },
  { label: "Malayalam", href: "/languages/malayalam" },
  { label: "Hindi", href: "/languages/hindi" },
  { label: "English", href: "/languages/english" },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.has("admin_token");

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <head>
        <meta name="google-site-verification" content="OpNiMjksppI2aV1P5G44Ek6EgS_4HjFHoLtffxNxLEU" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Sitewide structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sitewideSchema) }}
        />
        {/* Google Analytics 4 — Replace G-XXXXXXXXXX with your Measurement ID */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        {/* ── Navigation ── */}
        <header className="glass sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="hover:opacity-90 transition-opacity flex-shrink-0">
              <WorshipMountLogo size="md" />
            </Link>

            {/* Header Search Bar (Compact) */}
            <div className="flex-1 max-w-xs md:max-w-sm hidden sm:block">
              <SearchBar variant="compact" placeholder="Search songs, lyrics, artists..." />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {NAV_LANGUAGES.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[#F05A28] hover:bg-orange-500/10 rounded-xl transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && <AdminNavControls />}
            </div>
          </nav>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-[var(--color-border-subtle)] mt-auto bg-[var(--color-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Top row: Language hubs + Tools + Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">Languages</h3>
                <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  <li><Link href="/languages/kannada" className="hover:text-[var(--color-text-primary)] transition-colors">Kannada</Link></li>
                  <li><Link href="/languages/tamil" className="hover:text-[var(--color-text-primary)] transition-colors">Tamil</Link></li>
                  <li><Link href="/languages/telugu" className="hover:text-[var(--color-text-primary)] transition-colors">Telugu</Link></li>
                  <li><Link href="/languages/malayalam" className="hover:text-[var(--color-text-primary)] transition-colors">Malayalam</Link></li>
                  <li><Link href="/languages/hindi" className="hover:text-[var(--color-text-primary)] transition-colors">Hindi</Link></li>
                  <li><Link href="/languages/english" className="hover:text-[var(--color-text-primary)] transition-colors">English</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">Tools</h3>
                <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  <li><Link href="/tools/chord-transposer" className="hover:text-[var(--color-text-primary)] transition-colors">Chord Transposer</Link></li>
                  <li><Link href="/tools/ppt-generator" className="hover:text-[var(--color-text-primary)] transition-colors">PPT Generator</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">Discover</h3>
                <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  <li><Link href="/search" className="hover:text-[var(--color-text-primary)] transition-colors">Search Songs</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">Company</h3>
                <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  <li><Link href="/about" className="hover:text-[var(--color-text-primary)] transition-colors">About</Link></li>
                  <li><Link href="/contact" className="hover:text-[var(--color-text-primary)] transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>
            {/* Bottom row: copyright */}
            <div className="border-t border-[var(--color-border-subtle)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <WorshipMountLogo size="sm" showText={false} />
                <p className="text-sm font-medium text-[var(--color-text-muted)]">
                  © {new Date().getFullYear()} <strong className="text-[var(--color-text)]">Worship Mount</strong>. Multilingual gospel lyrics &amp; chords for the church.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
