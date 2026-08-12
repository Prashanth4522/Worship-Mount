/**
 * WeWorship — Chord Transposition Engine
 * 
 * Pure functions to transpose chord symbols by semitone intervals.
 * Handles standard chords, slash chords, and complex extensions.
 * Never mutates stored data — all transposition is a display transform.
 */

import { Token } from './types';

// ─── Semitone map ───

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Keys that conventionally use flats
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb',
                            'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

/**
 * Parse a chord string into root note and suffix.
 * Examples:
 *   "G"      → { root: "G", suffix: "" }
 *   "C#m7"   → { root: "C#", suffix: "m7" }
 *   "Bb/D"   → { root: "Bb", suffix: "/D" }
 *   "Ebmaj7" → { root: "Eb", suffix: "maj7" }
 */
function parseChord(chord: string): { root: string; suffix: string } | null {
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return null;
  return { root: match[1], suffix: match[2] };
}

/**
 * Get the semitone index of a note (0-11).
 * Handles both sharp and flat notation.
 */
function noteToIndex(note: string): number {
  let idx = NOTES_SHARP.indexOf(note);
  if (idx !== -1) return idx;
  idx = NOTES_FLAT.indexOf(note);
  if (idx !== -1) return idx;
  return -1;
}

/**
 * Determine whether to use flats or sharps based on the target key.
 */
function shouldUseFlats(originalKey: string, semitones: number): boolean {
  const parsed = parseChord(originalKey);
  if (!parsed) return false;
  const idx = noteToIndex(parsed.root);
  if (idx === -1) return false;
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  const newKeySharp = NOTES_SHARP[newIdx] + parsed.suffix;
  const newKeyFlat = NOTES_FLAT[newIdx] + parsed.suffix;
  // Prefer flats if the new key is conventionally flat
  return FLAT_KEYS.has(newKeyFlat) || FLAT_KEYS.has(NOTES_FLAT[newIdx]);
}

/**
 * Transpose a single note by the given number of semitones.
 */
function transposeNote(note: string, semitones: number, useFlats: boolean): string {
  const idx = noteToIndex(note);
  if (idx === -1) return note; // Unknown note, return as-is
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return useFlats ? NOTES_FLAT[newIdx] : NOTES_SHARP[newIdx];
}

/**
 * Transpose a full chord symbol (e.g., "C#m7/G#") by semitones.
 * Handles slash chords by transposing both root and bass note.
 */
export function transposeChord(chord: string, semitones: number, useFlats: boolean = false): string {
  if (semitones === 0) return chord;

  // Handle slash chords: "Am/G" → transpose both parts
  const slashIdx = chord.indexOf('/');
  if (slashIdx !== -1) {
    const mainPart = chord.substring(0, slashIdx);
    const bassPart = chord.substring(slashIdx + 1);
    const transposedMain = transposeChordSimple(mainPart, semitones, useFlats);
    const transposedBass = transposeChordSimple(bassPart, semitones, useFlats);
    return `${transposedMain}/${transposedBass}`;
  }

  return transposeChordSimple(chord, semitones, useFlats);
}

/**
 * Transpose a simple (non-slash) chord.
 */
function transposeChordSimple(chord: string, semitones: number, useFlats: boolean): string {
  const parsed = parseChord(chord);
  if (!parsed) return chord;
  const newRoot = transposeNote(parsed.root, semitones, useFlats);
  return newRoot + parsed.suffix;
}

/**
 * Transpose all chords in a token array.
 * Returns a new array (never mutates the original).
 */
export function transposeTokens(tokens: Token[], semitones: number, useFlats: boolean = false): Token[] {
  if (semitones === 0) return tokens;
  return tokens.map(token => ({
    text: token.text,
    chord: token.chord ? transposeChord(token.chord, semitones, useFlats) : null,
  }));
}

/**
 * Get the display key after transposition.
 * E.g., originalKey="G", semitones=2 → "A"
 */
export function getTransposedKey(originalKey: string, semitones: number): string {
  if (semitones === 0) return originalKey;
  const useFlats = shouldUseFlats(originalKey, semitones);
  return transposeChord(originalKey, semitones, useFlats);
}

/**
 * Determine whether to use flats for a given transposition.
 * Exported so components can pass it to transposeTokens consistently.
 */
export function getUseFlats(originalKey: string, semitones: number): boolean {
  return shouldUseFlats(originalKey, semitones);
}

/**
 * Get all 12 possible keys for a given original key.
 * Useful for a key selector dropdown.
 */
export function getAllKeys(originalKey: string): { key: string; semitones: number }[] {
  const results: { key: string; semitones: number }[] = [];
  for (let i = 0; i < 12; i++) {
    results.push({
      key: getTransposedKey(originalKey, i),
      semitones: i,
    });
  }
  return results;
}
