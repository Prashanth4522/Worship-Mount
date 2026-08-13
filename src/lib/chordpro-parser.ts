/**
 * WeWorship — ChordPro Parser
 * 
 * Parses ChordPro-style shorthand into the token array format
 * used throughout the application.
 * 
 * Input format:  "[G]Amazing [C]grace, [G]how sweet"
 * Output format: [
 *   { text: "Amazing ", chord: "G" },
 *   { text: "grace, ", chord: "C" },
 *   { text: "how sweet", chord: "G" }
 * ]
 * 
 * Also handles lines with no chords (plain lyrics).
 */

import { Token, SectionType } from './types';

/**
 * Parse a single ChordPro line into tokens.
 * 
 * Supports:
 * - "[G]text" → chord G over "text"
 * - "[Am7]text" → complex chords
 * - "[G/B]text" → slash chords  
 * - "text with no chords" → single token with null chord
 * - "[G] [C]text" → empty-text token for chord-only positions
 */
export function parseChordProLine(line: string): Token[] {
  const tokens: Token[] = [];
  
  // Regex to match [Chord]Text patterns
  // Captures: chord (inside brackets) and text (everything until next bracket or end)
  const regex = /\[([^\]]+)\]([^[]*)/g;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  
  // Check if there's text before the first chord
  const firstBracket = line.indexOf('[');
  if (firstBracket > 0) {
    tokens.push({ text: line.substring(0, firstBracket), chord: null });
    lastIndex = firstBracket;
  } else if (firstBracket === -1) {
    // No chords at all — return as a single token
    return [{ text: line, chord: null }];
  }
  
  // Extract [chord]text pairs
  regex.lastIndex = lastIndex;
  while ((match = regex.exec(line)) !== null) {
    const chord = match[1].trim();
    const text = match[2]; // Preserve whitespace in text
    tokens.push({ text, chord: chord || null });
  }
  
  // If no matches were found but line has content
  if (tokens.length === 0 && line.trim().length > 0) {
    tokens.push({ text: line, chord: null });
  }
  
  return tokens;
}

/**
 * Parse a section type from a ChordPro directive or label.
 * 
 * Supports formats like:
 * - "Verse 1", "Verse", "V1"
 * - "Chorus", "Ch"
 * - "Bridge", "Br"
 * - "Pre-Chorus", "PreChorus"
 * - "Intro", "Outro", "Tag"
 */
export function parseSectionType(label: string): SectionType {
  const normalized = label.toLowerCase().replace(/[-_\s]/g, '');
  
  if (normalized.startsWith('verse') || normalized.startsWith('v') && /\d/.test(normalized)) {
    return 'VERSE';
  }
  if (normalized.startsWith('chorus') || normalized.startsWith('ch')) {
    return 'CHORUS';
  }
  if (normalized.startsWith('bridge') || normalized.startsWith('br')) {
    return 'BRIDGE';
  }
  if (normalized.startsWith('prechorus') || normalized.startsWith('prech')) {
    return 'PRECHORUS';
  }
  if (normalized.startsWith('intro')) {
    return 'INTRO';
  }
  if (normalized.startsWith('outro')) {
    return 'OUTRO';
  }
  if (normalized.startsWith('tag')) {
    return 'TAG';
  }
  
  return 'VERSE'; // Default
}

/**
 * Full section structure as parsed from ChordPro text.
 */
export interface ParsedSection {
  type: SectionType;
  label: string;
  lines: Token[][];
}

/**
 * Parse a full ChordPro song text into structured sections.
 * 
 * Expected format:
 * ```
 * [Verse 1]
 * [G]Amazing [C]grace, [G]how sweet the [G]sound
 * [G]That saved [C]a [G]wretch like [D]me
 * 
 * [Chorus]
 * [C]I once was [G]lost, but [Am]now am [G]found
 * ```
 * 
 * Section headers are lines like "[Verse 1]" where the content
 * matches a known section type (not a chord).
 */
export function parseChordProSong(text: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = text.split('\n');
  
  let currentSection: ParsedSection | null = null;
  const sectionCounter: Record<string, number> = {};
  
  for (const rawLine of lines) {
    const line = rawLine.trim();
    
    // Skip empty lines (they separate sections visually but we handle with section headers)
    if (line === '') {
      continue;
    }
    
    // Check if this is a section header: [Verse 1], [Chorus], etc.
    // Distinguished from chords by: section headers are the entire line content
    // and match known section type names
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      const label = sectionMatch[1];
      const sectionType = parseSectionType(label);
      
      // Check if this is actually a section header (not just a lone chord)
      // Section headers contain letters and possibly numbers, not chord patterns
      const looksLikeSection = /^(verse|chorus|bridge|pre-?chorus|intro|outro|tag|v\d)/i.test(label);
      
      if (looksLikeSection) {
        currentSection = {
          type: sectionType,
          label: label,
          lines: [],
        };
        sections.push(currentSection);
        continue;
      }
    }
    
    // If no section has been started, create a default one
    if (!currentSection) {
      const type: SectionType = 'VERSE';
      const count = (sectionCounter[type] || 0) + 1;
      sectionCounter[type] = count;
      currentSection = {
        type,
        label: `Verse ${count}`,
        lines: [],
      };
      sections.push(currentSection);
    }
    
    // Parse the line as ChordPro tokens
    const tokens = parseChordProLine(line);
    if (tokens.length > 0) {
      currentSection.lines.push(tokens);
    }
  }
  
  return sections;
}
