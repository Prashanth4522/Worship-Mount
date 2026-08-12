import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WeWorship — Gospel Lyrics & Chords",
    template: "%s | WeWorship",
  },
  description:
    "Gospel song lyrics and chords in Kannada, Tamil, Malayalam, Telugu, Hindi, and English. Transpose chords, presentation mode, and free PowerPoint downloads.",
  keywords: [
    "gospel lyrics",
    "worship chords",
    "tamil christian songs",
    "kannada worship songs",
    "telugu christian lyrics",
    "malayalam worship",
    "hindi worship songs",
    "chord charts",
    "church worship",
  ],
};

const NAV_LANGUAGES = [
  { label: "Kannada", href: "/languages/kannada" },
  { label: "Tamil", href: "/languages/tamil" },
  { label: "Telugu", href: "/languages/telugu" },
  { label: "Malayalam", href: "/languages/malayalam" },
  { label: "Hindi", href: "/languages/hindi" },
  { label: "English", href: "/languages/english" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
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
      <body className="min-h-full flex flex-col">
        {/* ── Navigation ── */}
        <header className="glass sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
                <span className="text-white font-black text-lg">W</span>
              </div>
              <span className="text-lg font-black tracking-tight text-[var(--color-primary)] hidden sm:inline">
                Worship<span className="text-orange-500">Mount</span>
              </span>
            </Link>

            {/* Header Search Bar (Compact) */}
            <div className="flex-1 max-w-xs md:max-w-sm hidden sm:block">
              <SearchBar variant="compact" placeholder="Search..." />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { label: "Kannada", href: "/languages/kannada" },
                { label: "Tamil", href: "/languages/tamil" },
                { label: "Telugu", href: "/languages/telugu" },
                { label: "Malayalam", href: "/languages/malayalam" },
                { label: "Hindi", href: "/languages/hindi" },
                { label: "English", href: "/languages/english" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)] hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin/songs"
                className="ml-2 px-3 py-1.5 text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 rounded-xl transition-colors whitespace-nowrap shadow-sm"
              >
                + Admin
              </Link>
            </div>
          </nav>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1">{children}</main>

        {/* ── Footer ── */}
        <footer className="border-t border-[var(--color-border-subtle)] mt-auto bg-[var(--color-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                © {new Date().getFullYear()} Worship Mount. Multilingual gospel lyrics & chords for the church.
              </p>
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
