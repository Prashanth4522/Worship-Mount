import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { WorshipMountLogo } from "@/components/brand/Logo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://worshipmount.com"),
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
    url: "https://worshipmount.com",
    siteName: "Worship Mount",
    title: "Worship Mount — Gospel Lyrics & Chords",
    description:
      "Multilingual Gospel lyrics, chords, transposers, and PowerPoint slide deck generator for worship leaders and church teams.",
  },
};

const NAV_LANGUAGES = [
  { label: "Kannada", href: "/languages/kannada" },
  { label: "Tamil", href: "/languages/tamil" },
  { label: "Telugu", href: "/languages/telugu" },
  { label: "Malayalam", href: "/languages/malayalam" },
  { label: "Hindi", href: "/languages/hindi" },
  { label: "English", href: "/languages/english" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <head>
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
              <Link
                href="/admin/songs"
                className="ml-2 px-3 py-1.5 text-xs font-bold bg-[#F05A28] text-white hover:bg-[#d94e20] rounded-xl transition-colors whitespace-nowrap shadow-sm"
              >
                + Admin
              </Link>
            </div>
          </nav>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-[var(--color-border-subtle)] mt-auto bg-[var(--color-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <WorshipMountLogo size="sm" showText={false} />
                <p className="text-sm font-medium text-[var(--color-text-muted)]">
                  © {new Date().getFullYear()} <strong className="text-[var(--color-text)]">Worship Mount</strong>. Multilingual gospel lyrics & chords for the church.
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-[var(--color-text-muted)]">
                <Link href="/about" className="hover:text-[var(--color-text-primary)] transition-colors">
                  About
                </Link>
                <Link href="/contact" className="hover:text-[var(--color-text-primary)] transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
