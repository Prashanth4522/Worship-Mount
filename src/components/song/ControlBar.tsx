"use client";

import { useState, useRef, useEffect } from "react";
import { PPTMode } from "@/lib/ppt-generator";

interface ControlBarProps {
  displayKey: string;
  originalKey: string;
  transposed: boolean;
  showChords: boolean;
  fontSize: number;
  hasSecondaryVariant: boolean;
  onTranspose: (delta: number) => void;
  onResetTranspose: () => void;
  onToggleChords: () => void;
  onFontSize: (delta: number) => void;
  onPresentationMode: () => void;
  onDownloadPPT: (mode: PPTMode) => void;
}

export function ControlBar({
  displayKey,
  transposed,
  showChords,
  fontSize,
  hasSecondaryVariant,
  onTranspose,
  onResetTranspose,
  onToggleChords,
  onFontSize,
  onPresentationMode,
  onDownloadPPT,
}: ControlBarProps) {
  const [pptDropdownOpen, setPptDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPptDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="sticky top-16 z-40 mb-8 animate-slide-up"
      style={{ animationDelay: "0.15s" }}
    >
      <div className="glass rounded-2xl px-4 py-3 shadow-xl shadow-black/10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* ── Transpose ── */}
          <div className="flex items-center gap-1.5" id="transpose-controls">
            <span className="text-xs text-[var(--color-text-muted)] font-medium hidden sm:inline">
              Transpose
            </span>
            <button
              onClick={() => onTranspose(-1)}
              className="w-8 h-8 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-sm flex items-center justify-center transition-colors"
              id="transpose-down"
              title="Transpose down"
            >
              −
            </button>
            <button
              onClick={transposed ? onResetTranspose : undefined}
              className={`px-3 h-8 rounded-lg font-mono text-sm font-bold flex items-center justify-center transition-all ${
                transposed
                  ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] cursor-pointer hover:bg-[var(--color-accent)] hover:text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
              }`}
              title={transposed ? "Click to reset" : "Current key"}
              id="key-display"
            >
              {displayKey}
            </button>
            <button
              onClick={() => onTranspose(1)}
              className="w-8 h-8 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-sm flex items-center justify-center transition-colors"
              id="transpose-up"
              title="Transpose up"
            >
              +
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-[var(--color-border)] hidden sm:block" />

          {/* ── Font Size ── */}
          <div className="flex items-center gap-1.5" id="fontsize-controls">
            <button
              onClick={() => onFontSize(-0.1)}
              className="w-8 h-8 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold flex items-center justify-center transition-colors"
              title="Decrease font size"
              id="font-decrease"
            >
              A−
            </button>
            <span className="text-xs text-[var(--color-text-muted)] w-10 text-center font-mono font-medium">
              {Math.round(fontSize * 100)}%
            </span>
            <button
              onClick={() => onFontSize(0.1)}
              className="w-8 h-8 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-bold flex items-center justify-center transition-colors"
              title="Increase font size"
              id="font-increase"
            >
              A+
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-[var(--color-border)] hidden sm:block" />

          {/* ── Chords / Lyrics Toggle ── */}
          <div className="flex items-center bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)]" id="chords-lyrics-toggle">
            <button
              onClick={() => { if (!showChords) onToggleChords(); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                showChords
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
              id="view-mode-chords"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <span>Chords</span>
            </button>
            <button
              onClick={() => { if (showChords) onToggleChords(); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                !showChords
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
              id="view-mode-lyrics"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              <span>Lyrics</span>
            </button>
          </div>

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ── Presentation Mode ── */}
          <button
            onClick={onPresentationMode}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-hover)] transition-all shadow-sm"
            id="presentation-mode-btn"
            title="Presentation Mode"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span className="hidden sm:inline">Present</span>
          </button>

          {/* ── Download PPT Dropdown ── */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setPptDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-all shadow-md shadow-red-500/10"
              id="download-ppt-btn"
              title="Download PowerPoint Presentation (.pptx)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="hidden sm:inline">Download PPT</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {pptDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 glass-light rounded-2xl p-2 shadow-2xl z-50 border border-[var(--color-border)] animate-fade-in">
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => {
                      onDownloadPPT("single");
                      setPptDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--color-accent-muted)] transition-colors flex items-center gap-2.5 group"
                    id="ppt-download-single"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      1x
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">
                        Native PPT Deck
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        Lyrics for active script
                      </p>
                    </div>
                  </button>

                  {hasSecondaryVariant && (
                    <button
                      onClick={() => {
                        onDownloadPPT("parallel");
                        setPptDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--color-accent-muted)] transition-colors flex items-center gap-2.5 group"
                      id="ppt-download-parallel"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-secondary)] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        2x
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-primary)]">
                          Parallel Dual PPT Deck
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          Native script + Transliteration stacked
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
