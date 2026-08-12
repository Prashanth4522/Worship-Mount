"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { parseChordProSong } from "@/lib/chordpro-parser";
import { LyricsRenderer } from "@/components/song/LyricsRenderer";
import { ScriptMode, SCRIPT_MODE_LABELS, SectionData, LineData } from "@/lib/types";

interface ArtistOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface VariantForm {
  id?: string;
  language: ScriptMode;
  title: string;
  isPrimary: boolean;
  chordProText: string;
}

interface SongFormProps {
  initialData?: {
    id?: string;
    titleEn: string;
    originalLanguage: ScriptMode;
    originalKey: string;
    ccliOrSource?: string | null;
    status: "DRAFT" | "PUBLISHED";
    tags?: string | null;
    artistIds: string[];
    categoryIds: string[];
    variants: VariantForm[];
  };
  isEditing?: boolean;
}

const KEYS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const LANGUAGES: { code: ScriptMode; label: string }[] = [
  { code: "KN", label: "Kannada (Native)" },
  { code: "KN_TRANSLIT", label: "Eng-Kannada (Transliterated)" },
  { code: "TA", label: "Tamil (Native)" },
  { code: "TA_TRANSLIT", label: "Tanglish (Transliterated)" },
  { code: "TE", label: "Telugu (Native)" },
  { code: "TE_TRANSLIT", label: "Eng-Telugu (Transliterated)" },
  { code: "ML", label: "Malayalam (Native)" },
  { code: "ML_TRANSLIT", label: "Eng-Malayalam (Transliterated)" },
  { code: "HI_TRANSLIT", label: "Eng-Hindi (Transliterated)" },
  { code: "EN", label: "English" },
];

export function SongForm({ initialData, isEditing = false }: SongFormProps) {
  const router = useRouter();

  // ── Form State ──
  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "");
  const [originalLanguage, setOriginalLanguage] = useState<ScriptMode>(
    initialData?.originalLanguage || "TA"
  );
  const [originalKey, setOriginalKey] = useState(initialData?.originalKey || "C");
  const [ccliOrSource, setCcliOrSource] = useState(initialData?.ccliOrSource || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initialData?.status || "PUBLISHED");
  const [tagsInput, setTagsInput] = useState(initialData?.tags || "");
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>(initialData?.artistIds || []);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialData?.categoryIds || []);

  // Variants state
  const [variants, setVariants] = useState<VariantForm[]>(
    initialData?.variants || [
      {
        language: "TA",
        title: "",
        isPrimary: true,
        chordProText: `[Chorus]\n[C]Yesuve [Am]nee enakku [F]podhum\n[G]Un anbu [C]enakku [F]podhum [G]\n\n[Verse 1]\n[C]Enakkaaga [G]uyir thandhaar`,
      },
    ]
  );
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);

  // Lists from API
  const [artists, setArtists] = useState<ArtistOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New artist inline modal state
  const [newArtistName, setNewArtistName] = useState("");
  const [creatingArtist, setCreatingArtist] = useState(false);

  // Fetch dropdown options
  useEffect(() => {
    async function fetchData() {
      try {
        const [resArtists, resCategories] = await Promise.all([
          fetch("/api/admin/artists"),
          fetch("/api/admin/categories"),
        ]);
        const dataArtists = await resArtists.json();
        const dataCategories = await resCategories.json();
        if (dataArtists.artists) setArtists(dataArtists.artists);
        if (dataCategories.categories) setCategories(dataCategories.categories);
      } catch (err) {
        console.error("Failed to load select options:", err);
      }
    }
    fetchData();
  }, []);

  // ── Handle inline artist creation ──
  const handleAddArtist = async () => {
    if (!newArtistName.trim()) return;
    setCreatingArtist(true);
    try {
      const res = await fetch("/api/admin/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newArtistName.trim() }),
      });
      const data = await res.json();
      if (data.artist) {
        setArtists((prev) => [...prev, data.artist]);
        setSelectedArtistIds((prev) => [...prev, data.artist.id]);
        setNewArtistName("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingArtist(false);
    }
  };

  // ── Variant Helpers ──
  const activeVariant = variants[activeVariantIdx] || variants[0];

  const updateActiveVariant = (field: keyof VariantForm, value: any) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === activeVariantIdx ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () => {
    const nextLang = LANGUAGES.find((l) => !variants.some((v) => v.language === l.code))?.code || "TA_TRANSLIT";
    setVariants((prev) => [
      ...prev,
      {
        language: nextLang,
        title: titleEn,
        isPrimary: false,
        chordProText: "[Chorus]\n[C]New variant lyrics",
      },
    ]);
    setActiveVariantIdx(variants.length);
  };

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== idx));
    setActiveVariantIdx(0);
  };

  // ── Live ChordPro Parser Preview ──
  const parsedSectionsPreview: SectionData[] = useMemo(() => {
    const parsed = parseChordProSong(activeVariant?.chordProText || "");
    return parsed.map((sec, sIdx) => ({
      id: `sec-preview-${sIdx}`,
      variantId: "preview",
      order: sIdx + 1,
      type: sec.type,
      label: sec.label,
      lines: sec.lines.map((tokens, lIdx) => ({
        id: `line-preview-${lIdx}`,
        sectionId: `sec-preview-${sIdx}`,
        order: lIdx + 1,
        tokens,
      })),
    }));
  }, [activeVariant?.chordProText]);

  // ── Submit Handler ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titleEn.trim()) {
      setError("Please provide an English Title");
      return;
    }

    setLoading(true);

    const payload = {
      titleEn: titleEn.trim(),
      originalLanguage,
      originalKey,
      ccliOrSource: ccliOrSource.trim(),
      status,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      artistIds: selectedArtistIds,
      categoryIds: selectedCategoryIds,
      variants,
    };

    try {
      const url = isEditing && initialData?.id ? `/api/admin/songs/${initialData.id}` : "/api/admin/songs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save song");
      }

      router.push("/admin/songs");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* ── Metadata Section ── */}
      <div className="glass rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-[var(--color-primary)] border-b border-[var(--color-border)] pb-3">
          Song Metadata
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title EN */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">
              Song English Title *
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Yesuve Nee Enakku"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold text-sm outline-none focus:border-[var(--color-accent)]"
              required
            />
          </div>

          {/* Original Language */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">
              Original Song Language *
            </label>
            <select
              value={originalLanguage}
              onChange={(e) => setOriginalLanguage(e.target.value as ScriptMode)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold text-sm outline-none focus:border-[var(--color-accent)]"
            >
              <option value="TA">Tamil (தமிழ்)</option>
              <option value="KN">Kannada (ಕನ್ನಡ)</option>
              <option value="TE">Telugu (తెలుగు)</option>
              <option value="ML">Malayalam (മലയാളം)</option>
              <option value="HI">Hindi (हिन्दी)</option>
              <option value="EN">English</option>
            </select>
          </div>

          {/* Original Key */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">
              Original Key *
            </label>
            <select
              value={originalKey}
              onChange={(e) => setOriginalKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold text-sm outline-none focus:border-[var(--color-accent)]"
            >
              {KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* CCLI / Source */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">
              CCLI # or Credit Source
            </label>
            <input
              type="text"
              value={ccliOrSource}
              onChange={(e) => setCcliOrSource(e.target.value)}
              placeholder="e.g. CCLI #7123456 or Gersson Edinbaro"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Publication Status */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">
              Publication Status
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStatus("PUBLISHED")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  status === "PUBLISHED"
                    ? "bg-[var(--color-accent)] text-white shadow-sm"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                }`}
              >
                PUBLISHED
              </button>
              <button
                type="button"
                onClick={() => setStatus("DRAFT")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  status === "DRAFT"
                    ? "bg-[var(--color-secondary)] text-white shadow-sm"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                }`}
              >
                DRAFT
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">
              Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Worship, Grace, Praise"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* ── Artists Selection & Add ── */}
        <div className="pt-4 border-t border-[var(--color-border-subtle)]">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">
            Artists / Worship Leaders
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {artists.map((artist) => {
              const selected = selectedArtistIds.includes(artist.id);
              return (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() =>
                    setSelectedArtistIds((prev) =>
                      selected ? prev.filter((id) => id !== artist.id) : [...prev, artist.id]
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selected
                      ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {artist.name}
                </button>
              );
            })}
          </div>

          {/* Inline Add Artist */}
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={newArtistName}
              onChange={(e) => setNewArtistName(e.target.value)}
              placeholder="Add new artist name..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none"
            />
            <button
              type="button"
              onClick={handleAddArtist}
              disabled={creatingArtist || !newArtistName.trim()}
              className="px-3 py-1.5 rounded-xl bg-[var(--color-secondary)] text-white text-xs font-bold hover:bg-[var(--color-secondary-hover)] transition-colors disabled:opacity-50"
            >
              {creatingArtist ? "Adding..." : "+ Create Artist"}
            </button>
          </div>
        </div>

        {/* ── Categories Selection ── */}
        <div className="pt-4 border-t border-[var(--color-border-subtle)]">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">
            Categories / Themes
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const selected = selectedCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategoryIds((prev) =>
                      selected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selected
                      ? "bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] shadow-sm"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Multilingual Variant Editor & Live Preview ── */}
      <div className="glass rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <h2 className="text-lg font-bold text-[var(--color-primary)]">
            Song Lyrics & Script Variants
          </h2>
          <button
            type="button"
            onClick={addVariant}
            className="px-3 py-1.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm"
          >
            + Add Language Variant
          </button>
        </div>

        {/* Variant Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {variants.map((v, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveVariantIdx(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                activeVariantIdx === idx
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
              }`}
            >
              <span>{SCRIPT_MODE_LABELS[v.language] || v.language}</span>
              {v.isPrimary && (
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded uppercase">
                  Primary
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Selected Variant Form */}
        {activeVariant && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Language Selection */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">
                  Variant Script Mode
                </label>
                <select
                  value={activeVariant.language}
                  onChange={(e) => updateActiveVariant("language", e.target.value as ScriptMode)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Native Script Title */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">
                  Variant Title (Native Script)
                </label>
                <input
                  type="text"
                  value={activeVariant.title}
                  onChange={(e) => updateActiveVariant("title", e.target.value)}
                  placeholder="e.g. யேசுவே நீ எனக்கு"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold outline-none"
                />
              </div>

              {/* Is Primary Checkbox */}
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isPrimaryCheckbox"
                  checked={activeVariant.isPrimary}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setVariants((prev) =>
                      prev.map((v, i) => ({
                        ...v,
                        isPrimary: i === activeVariantIdx ? isChecked : isChecked ? false : v.isPrimary,
                      }))
                    );
                  }}
                  className="w-4 h-4 rounded text-[var(--color-accent)] cursor-pointer"
                />
                <label htmlFor="isPrimaryCheckbox" className="text-xs font-bold text-[var(--color-text-primary)] cursor-pointer">
                  Default Primary Variant
                </label>

                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(activeVariantIdx)}
                    className="ml-auto text-xs font-bold text-red-500 hover:underline"
                  >
                    Delete Variant
                  </button>
                )}
              </div>
            </div>

            {/* Side-by-Side: ChordPro Input & Live Render Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* ChordPro Code Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">
                    ChordPro Format Text Input
                  </label>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                    Format: [Chorus] and [C]Word
                  </span>
                </div>
                <textarea
                  rows={16}
                  value={activeVariant.chordProText}
                  onChange={(e) => updateActiveVariant("chordProText", e.target.value)}
                  className="w-full p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] leading-relaxed"
                  placeholder="[Chorus]&#10;[C]Yesuve [Am]nee enakku [F]podhum..."
                />
              </div>

              {/* Live Preview Container */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[var(--color-accent)] uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                    Live Chords Render Preview
                  </label>
                </div>
                <div className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] max-h-[380px] overflow-y-auto">
                  <LyricsRenderer
                    sections={parsedSectionsPreview}
                    showChords={true}
                    semitones={0}
                    useFlats={false}
                    fontSize={1}
                    language={activeVariant.language}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Form Action Buttons ── */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/songs")}
          className="px-6 py-3 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-secondary)] font-bold text-sm border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-[var(--color-accent)] text-white font-bold text-sm hover:bg-[var(--color-accent-hover)] transition-all shadow-lg shadow-red-500/10 disabled:opacity-50"
        >
          {loading ? "Saving..." : isEditing ? "Save Song Changes" : "Publish Song"}
        </button>
      </div>
    </form>
  );
}
