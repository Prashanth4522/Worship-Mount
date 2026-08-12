/**
 * WeWorship — Core TypeScript types
 * 
 * These types define the token-based data model that drives
 * lyrics rendering, chord transposition, and PPT generation.
 */

// ─── Token: the atomic unit of lyrics + chords ───

export interface Token {
  /** The lyric text fragment (e.g., "Amazing ") */
  text: string;
  /** Chord symbol placed above this token, or null if no chord */
  chord: string | null;
}

// ─── Enums matching Prisma schema ───

export type Language = 'KN' | 'TA' | 'ML' | 'TE' | 'HI' | 'EN';

export type ScriptMode =
  | 'KN' | 'KN_TRANSLIT'
  | 'TA' | 'TA_TRANSLIT'
  | 'ML' | 'ML_TRANSLIT'
  | 'TE' | 'TE_TRANSLIT'
  | 'HI_TRANSLIT'
  | 'EN';

export type SectionType =
  | 'VERSE' | 'CHORUS' | 'BRIDGE' | 'PRECHORUS'
  | 'INTRO' | 'OUTRO' | 'TAG';

export type SongStatus = 'DRAFT' | 'PUBLISHED';

// ─── Display labels for script modes ───

export const SCRIPT_MODE_LABELS: Record<ScriptMode, string> = {
  KN: 'ಕನ್ನಡ',
  KN_TRANSLIT: 'Eng-Kannada',
  TA: 'தமிழ்',
  TA_TRANSLIT: 'Tanglish',
  ML: 'മലയാളം',
  ML_TRANSLIT: 'Eng-Malayalam',
  TE: 'తెలుగు',
  TE_TRANSLIT: 'Eng-Telugu',
  HI_TRANSLIT: 'Eng-Hindi',
  EN: 'English',
};

// ─── Language display names ───

export const LANGUAGE_LABELS: Record<Language, string> = {
  KN: 'Kannada',
  TA: 'Tamil',
  ML: 'Malayalam',
  TE: 'Telugu',
  HI: 'Hindi',
  EN: 'English',
};

// ─── Section type display labels ───

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  VERSE: 'Verse',
  CHORUS: 'Chorus',
  BRIDGE: 'Bridge',
  PRECHORUS: 'Pre-Chorus',
  INTRO: 'Intro',
  OUTRO: 'Outro',
  TAG: 'Tag',
};

// ─── API / Component data shapes ───

export interface SongData {
  id: string;
  slug: string;
  titleEn: string;
  originalLanguage: Language;
  originalKey: string;
  ccliOrSource: string | null;
  status: SongStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  variants: VariantData[];
  artists: ArtistData[];
  categories: CategoryData[];
}

export interface VariantData {
  id: string;
  songId: string;
  language: ScriptMode;
  title: string;
  isPrimary: boolean;
  sections: SectionData[];
}

export interface SectionData {
  id: string;
  variantId: string;
  order: number;
  type: SectionType;
  label: string;
  lines: LineData[];
}

export interface LineData {
  id: string;
  sectionId: string;
  order: number;
  tokens: Token[];
}

export interface ArtistData {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  image: string | null;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

// ─── Transpose options ───

export interface TransposeState {
  /** Number of semitones to shift (positive = up, negative = down) */
  semitones: number;
  /** The displayed key after transposition */
  displayKey: string;
}

// ─── Song page view state ───

export interface SongViewState {
  activeVariantId: string;
  transpose: TransposeState;
  fontSize: number; // multiplier, 1 = default
  showChords: boolean;
  presentationMode: boolean;
}
