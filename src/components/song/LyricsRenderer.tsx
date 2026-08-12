"use client";

import { useMemo } from "react";
import { SectionData, Token, ScriptMode } from "@/lib/types";
import { transposeTokens } from "@/lib/transpose";

interface LyricsRendererProps {
  sections: SectionData[];
  showChords: boolean;
  semitones: number;
  useFlats: boolean;
  fontSize: number;
  language: ScriptMode;
}

// Font families for Indic scripts
const SCRIPT_FONTS: Partial<Record<ScriptMode, string>> = {
  KN: "'Noto Sans Kannada', sans-serif",
  TA: "'Noto Sans Tamil', sans-serif",
  ML: "'Noto Sans Malayalam', sans-serif",
  TE: "'Noto Sans Telugu', sans-serif",
  HI_TRANSLIT: "'Noto Sans Devanagari', sans-serif",
};

// Render a single token (text + optional chord above)
function TokenRenderer({
  token,
  showChord,
  fontSize,
}: {
  token: Token;
  showChord: boolean;
  fontSize: number;
}) {
  const hasChord = showChord && token.chord;

  return (
    <span className="token">
      {hasChord ? (
        <span className="chord-badge">{token.chord}</span>
      ) : null}
      <span
        className="token-text"
        style={{ fontSize: `${fontSize}rem` }}
      >
        {token.text}
      </span>
    </span>
  );
}

export function LyricsRenderer({
  sections,
  showChords,
  semitones,
  useFlats,
  fontSize,
  language,
}: LyricsRendererProps) {
  // Check if any section has chords at all
  const hasAnyChords = useMemo(
    () =>
      sections.some((s) =>
        s.lines.some((l) => l.tokens.some((t) => t.chord !== null))
      ),
    [sections]
  );

  const fontFamily = SCRIPT_FONTS[language] || "inherit";
  const effectiveFontSize = fontSize;

  return (
    <div
      className="animate-slide-up space-y-6"
      style={{
        animationDelay: "0.2s",
        fontFamily,
      }}
    >
      {sections.map((section) => (
        <div
          key={section.id}
          className="section-card"
          id={`section-${section.id}`}
        >
          {/* Section label with bottom divider */}
          <div className="section-header">
            <span className="section-label">{section.label}</span>
          </div>

          {/* Lines */}
          <div className="space-y-2 sm:space-y-3">
            {section.lines.map((line) => {
              // Apply transposition to the line's tokens
              const tokens = semitones !== 0
                ? transposeTokens(line.tokens, semitones, useFlats)
                : line.tokens;

              return (
                <div key={line.id} className="lyric-line">
                  {tokens.map((token, idx) => (
                    <TokenRenderer
                      key={`${line.id}-${idx}`}
                      token={token}
                      showChord={showChords && hasAnyChords}
                      fontSize={effectiveFontSize}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

