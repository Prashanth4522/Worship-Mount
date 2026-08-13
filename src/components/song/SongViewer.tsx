"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { SongData, ScriptMode, SCRIPT_MODE_LABELS } from "@/lib/types";
import { getTransposedKey, getUseFlats } from "@/lib/transpose";
import { PPTMode } from "@/lib/ppt-generator";
import { SongHeader } from "./SongHeader";
import { ScriptSwitcher } from "./ScriptSwitcher";
import { ControlBar } from "./ControlBar";
import { LyricsRenderer } from "./LyricsRenderer";
import { PresentationMode } from "./PresentationMode";

interface SongViewerProps {
  song: SongData;
}

export function SongViewer({ song }: SongViewerProps) {
  // ── Determine available variants ──
  const variants = song.variants;
  const primaryVariant = variants.find((v) => v.isPrimary) || variants[0];

  // ── State ──
  const [activeVariantId, setActiveVariantId] = useState(primaryVariant?.id || "");
  const [semitones, setSemitones] = useState(0);
  const [fontSize, setFontSize] = useState(1);
  const [showChords, setShowChords] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);

  // Check URL params on load (e.g. ?view=lyrics)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "lyrics") {
        setTimeout(() => setShowChords(false), 0);
      }
    }
  }, []);

  // ── Derived ──
  const activeVariant = useMemo(
    () => variants.find((v) => v.id === activeVariantId) || primaryVariant,
    [activeVariantId, variants, primaryVariant]
  );

  const secondaryVariant = useMemo(
    () => variants.find((v) => v.id !== activeVariant?.id),
    [variants, activeVariant]
  );

  const displayKey = useMemo(
    () => getTransposedKey(song.originalKey, semitones),
    [song.originalKey, semitones]
  );

  const useFlats = useMemo(
    () => getUseFlats(song.originalKey, semitones),
    [song.originalKey, semitones]
  );

  // ── Script mode info for switcher ──
  const availableModes: { id: string; language: ScriptMode; label: string }[] = useMemo(
    () =>
      variants.map((v) => ({
        id: v.id,
        language: v.language,
        label: SCRIPT_MODE_LABELS[v.language] || v.language,
      })),
    [variants]
  );

  // ── Handlers ──
  const handleTranspose = useCallback((delta: number) => {
    setSemitones((prev) => {
      const next = prev + delta;
      if (next >= 12) return next - 12;
      if (next <= -12) return next + 12;
      return next;
    });
  }, []);

  const handleFontSize = useCallback((delta: number) => {
    setFontSize((prev) => {
      const next = prev + delta;
      return Math.max(0.6, Math.min(2, next));
    });
  }, []);

  const handleResetTranspose = useCallback(() => {
    setSemitones(0);
  }, []);

  const handleDownloadPPT = useCallback(
    (mode: PPTMode) => {
      if (!activeVariant) return;

      const params = new URLSearchParams({
        variant: activeVariant.id,
        mode,
      });

      if (secondaryVariant) {
        params.set("secondary", secondaryVariant.id);
      }

      const downloadUrl = `/api/songs/${song.slug}/ppt?${params.toString()}`;
      window.open(downloadUrl, "_blank");
    },
    [activeVariant, secondaryVariant, song.slug]
  );

  if (!activeVariant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-[var(--color-text-muted)]">No lyrics available for this song.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Song Header */}
        <SongHeader
          title={activeVariant.title}
          titleEn={song.titleEn}
          artists={song.artists}
          categories={song.categories}
          originalKey={song.originalKey}
          displayKey={displayKey}
          transposed={semitones !== 0}
        />

        {/* Script Switcher (only if multiple variants) */}
        {variants.length > 1 && (
          <ScriptSwitcher
            modes={availableModes}
            activeId={activeVariantId}
            onSwitch={setActiveVariantId}
          />
        )}

        {/* Control Bar */}
        <ControlBar
          displayKey={displayKey}
          originalKey={song.originalKey}
          transposed={semitones !== 0}
          showChords={showChords}
          fontSize={fontSize}
          hasSecondaryVariant={Boolean(secondaryVariant)}
          onTranspose={handleTranspose}
          onResetTranspose={handleResetTranspose}
          onToggleChords={() => setShowChords((v) => !v)}
          onFontSize={handleFontSize}
          onPresentationMode={() => setPresentationMode(true)}
          onDownloadPPT={handleDownloadPPT}
        />

        {/* Lyrics + Chords */}
        <LyricsRenderer
          sections={activeVariant.sections}
          showChords={showChords}
          semitones={semitones}
          useFlats={useFlats}
          fontSize={fontSize}
          language={activeVariant.language}
        />
      </div>

      {/* Presentation Mode Overlay */}
      {presentationMode && (
        <PresentationMode
          variant={activeVariant}
          allVariants={song.variants}
          onExit={() => setPresentationMode(false)}
        />
      )}
    </div>
  );
}
