"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { VariantData, SCRIPT_MODE_LABELS } from "@/lib/types";

interface PresentationModeProps {
  variant: VariantData;
  allVariants: VariantData[];
  onExit: () => void;
}

type ScrollSpeed = "slow" | "medium" | "fast";

const SCROLL_SPEEDS: Record<ScrollSpeed, number> = {
  slow: 0.5,
  medium: 1.2,
  fast: 2.2,
};

export function PresentationMode({ variant, allVariants, onExit }: PresentationModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── State ──
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<ScrollSpeed>("medium");
  const [fontSizeScale, setFontSizeScale] = useState(1); // 1 = default
  const [secondaryVariantId, setSecondaryVariantId] = useState<string>("");

  const animFrameRef = useRef<number | null>(null);

  // ── Secondary variant (for bilingual mode) ──
  const secondaryVariant = useMemo(
    () => allVariants.find((v) => v.id === secondaryVariantId),
    [allVariants, secondaryVariantId]
  );

  const availableSecondaryVariants = useMemo(
    () => allVariants.filter((v) => v.id !== variant.id),
    [allVariants, variant.id]
  );

  // ── Browser Fullscreen API ──
  useEffect(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }

    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // ── Scroll to specific section ──
  const scrollToSection = useCallback((sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // ── Keyboard Navigation ──
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.key) {
        case "Escape":
          onExit();
          break;
        case " ":
          e.preventDefault();
          setIsScrolling((prev) => !prev);
          break;
        case "ArrowUp":
          e.preventDefault();
          containerRef.current?.scrollBy({ top: -150, behavior: "smooth" });
          break;
        case "ArrowDown":
          e.preventDefault();
          containerRef.current?.scrollBy({ top: 150, behavior: "smooth" });
          break;
        default: {
          const num = parseInt(e.key);
          if (!isNaN(num) && num >= 1 && num <= variant.sections.length) {
            e.preventDefault();
            const targetSection = variant.sections[num - 1];
            if (targetSection) {
              scrollToSection(targetSection.id);
            }
          }
          break;
        }
      }
    },
    [onExit, variant.sections, scrollToSection]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleKeyDown]);

  // ── Auto-scroll Animation Loop ──
  useEffect(() => {
    if (!isScrolling || !containerRef.current) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const speed = SCROLL_SPEEDS[scrollSpeed];

    const scroll = () => {
      if (containerRef.current) {
        containerRef.current.scrollTop += speed;
      }
      animFrameRef.current = requestAnimationFrame(scroll);
    };

    animFrameRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isScrolling, scrollSpeed]);

  // Map secondary variant lines by section type and line index for parallel rendering
  const secondaryLinesMap = useMemo(() => {
    if (!secondaryVariant) return null;
    const map: Record<string, string[]> = {};
    secondaryVariant.sections.forEach((sec) => {
      map[sec.type] = sec.lines.map((l) =>
        l.tokens.map((t) => t.text).join("")
      );
    });
    return map;
  }, [secondaryVariant]);

  return (
    <div
      className="presentation-overlay animate-fade-in"
      ref={containerRef}
    >
      {/* ── Top Bar: Section Quick-Jump Pills ── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 glass rounded-full px-4 py-2 border border-white/10 opacity-40 hover:opacity-100 transition-opacity duration-300 max-w-[90vw] overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-[#E04624] tracking-wider mr-1 hidden sm:inline">
          Jump to:
        </span>
        {variant.sections.map((sec, idx) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-[#E04624] hover:text-white text-white/90 transition-all whitespace-nowrap"
            title={`Jump to ${sec.label} (Press ${idx + 1})`}
          >
            <span className="text-[#E04624] group-hover:text-white mr-1 font-mono text-[10px]">{idx + 1}</span>
            {sec.label}
          </button>
        ))}
      </div>

      {/* ── Exit Button ── */}
      <button
        className="presentation-exit"
        onClick={onExit}
        title="Exit Presentation (ESC)"
        id="presentation-exit-btn"
      >
        ✕
      </button>

      {/* ── Main Lyrics Projection ── */}
      <div
        className="presentation-lyrics transition-all duration-200"
        style={{ fontSize: `${2.2 * fontSizeScale}rem` }}
      >
        {variant.sections.map((section) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
            className="presentation-section scroll-mt-20"
            id={`pres-section-${section.id}`}
          >
            {/* Section Badge */}
            <div className="presentation-section-label flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E04624]" />
              {section.label}
              <span className="w-2 h-2 rounded-full bg-[#E04624]" />
            </div>

            {/* Lines */}
            {secondaryLinesMap && secondaryLinesMap[section.type] ? (
              <div className="space-y-6 my-6 text-center">
                {/* Primary / Native Block */}
                <div className="space-y-2">
                  {section.lines.map((line) => (
                    <div key={line.id} className="text-white font-bold drop-shadow-md">
                      {line.tokens.map((t) => t.text).join("").trim()}
                    </div>
                  ))}
                </div>

                {/* Transliteration Block */}
                <div className="space-y-2 pt-2">
                  {section.lines.map((line, lineIdx) => {
                    const secondaryText = secondaryLinesMap[section.type]?.[lineIdx];
                    if (!secondaryText) return null;
                    return (
                      <div key={`sec-line-${lineIdx}`} className="text-white/90 font-semibold text-[0.85em] tracking-wide">
                        {secondaryText.trim()}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              section.lines.map((line) => (
                <div key={line.id} className="presentation-line my-4 text-center">
                  <div className="text-white font-medium drop-shadow-md">
                    {line.tokens.map((t) => t.text).join("")}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* ── Floating Controls Toolbar (Hover reveal) ── */}
      <div className="presentation-controls" id="presentation-controls-bar">
        {/* Play/Pause Scroll */}
        <button
          onClick={() => setIsScrolling((prev) => !prev)}
          className="w-10 h-10 rounded-full bg-[#E04624] hover:bg-[#C83B1B] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
          title={isScrolling ? "Pause (Space)" : "Auto-scroll (Space)"}
          id="pres-scroll-toggle"
        >
          {isScrolling ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
          {(["slow", "medium", "fast"] as ScrollSpeed[]).map((speed) => (
            <button
              key={speed}
              onClick={() => setScrollSpeed(speed)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                scrollSpeed === speed
                  ? "bg-[#E04624] text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {speed.charAt(0).toUpperCase() + speed.slice(1)}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/20 hidden sm:block" />

        {/* Font Scaling inside Presentation */}
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
          <button
            onClick={() => setFontSizeScale((s) => Math.max(0.7, s - 0.1))}
            className="w-7 h-7 rounded-full hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center"
            title="Decrease Projection Font Size"
          >
            A−
          </button>
          <span className="text-[10px] font-mono text-white/70 w-8 text-center">
            {Math.round(fontSizeScale * 100)}%
          </span>
          <button
            onClick={() => setFontSizeScale((s) => Math.min(1.6, s + 0.1))}
            className="w-7 h-7 rounded-full hover:bg-white/20 text-sm font-bold text-white flex items-center justify-center"
            title="Increase Projection Font Size"
          >
            A+
          </button>
        </div>

        {/* Bilingual Parallel Mode Toggle */}
        {availableSecondaryVariants.length > 0 && (
          <select
            value={secondaryVariantId}
            onChange={(e) => setSecondaryVariantId(e.target.value)}
            className="bg-white/10 text-white text-xs font-medium px-2.5 py-1.5 rounded-full border border-white/20 outline-none cursor-pointer hover:bg-white/20"
          >
            <option value="" className="bg-neutral-900 text-white">
              Single Language
            </option>
            {availableSecondaryVariants.map((v) => (
              <option key={v.id} value={v.id} className="bg-neutral-900 text-white">
                Dual: + {SCRIPT_MODE_LABELS[v.language] || v.language}
              </option>
            ))}
          </select>
        )}

        {/* Shortcut hints */}
        <div className="text-[11px] text-white/40 hidden lg:block ml-2 font-mono">
          Space: Scroll · 1-9: Jump · Esc: Exit
        </div>
      </div>
    </div>
  );
}
