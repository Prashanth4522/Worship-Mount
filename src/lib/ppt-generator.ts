import pptxgen from "pptxgenjs";
import { SongData, VariantData, SCRIPT_MODE_LABELS } from "./types";

export type PPTMode = "single" | "parallel";

export interface PPTOptions {
  song: SongData;
  variantId: string;
  secondaryVariantId?: string;
  mode: PPTMode;
}

/**
 * Palette based on exact church projection specifications:
 * Background: Pure Black (#000000)
 * Primary Text: Pure White (#FFFFFF)
 * Accent Color: Orange / Red (#E04624)
 * Muted Text: Soft Gray (#A0A0A5)
 */
const PALETTE = {
  bg: "000000",
  primary: "FFFFFF",
  accent: "E04624",
  textDark: "FFFFFF",
  textMuted: "A0A0A5",
};

/**
 * Generates a single unified PowerPoint presentation (.pptx) buffer for a given song.
 */
export async function generateSongPPT(options: PPTOptions): Promise<Buffer> {
  const { song, variantId, secondaryVariantId, mode } = options;

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "WeWorship";
  pptx.company = "WeWorship";
  pptx.title = `${song.titleEn} — PowerPoint Deck`;

  // Find primary variant
  const primaryVariant =
    song.variants.find((v) => v.id === variantId) ||
    song.variants.find((v) => v.isPrimary) ||
    song.variants[0];

  if (!primaryVariant) {
    throw new Error("No primary variant found for song");
  }

  // Find secondary variant if parallel mode is enabled
  const secondaryVariant =
    mode === "parallel" && secondaryVariantId
      ? song.variants.find((v) => v.id === secondaryVariantId)
      : null;

  // Build secondary lines lookup map by section type and line index
  const secondaryLinesMap: Record<string, string[]> = {};
  if (secondaryVariant) {
    secondaryVariant.sections.forEach((sec) => {
      secondaryLinesMap[sec.type] = sec.lines.map((l) =>
        l.tokens.map((t) => t.text).join("")
      );
    });
  }

  // ═══════════════════════════════════════════════════════════
  // SLIDE 1: Title / Intro Slide
  // ═══════════════════════════════════════════════════════════
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: PALETTE.bg };

  // Song Title (Centered)
  const songTitleText =
    primaryVariant.title !== song.titleEn
      ? `${primaryVariant.title}\n(${song.titleEn})`
      : primaryVariant.title;

  titleSlide.addText(songTitleText, {
    x: 0.5,
    y: 0.6,
    w: 9.0,
    h: 4.4,
    align: "center",
    valign: "middle",
    fontSize: 40,
    color: PALETTE.primary,
    bold: true,
  });

  // ═══════════════════════════════════════════════════════════
  // SLIDE GENERATION: Section Slides (Adaptive sizing)
  // ═══════════════════════════════════════════════════════════

  // Adaptive sizing presets for single-language mode
  function getSingleSizing(lineCount: number) {
    if (lineCount <= 2) return { fontSize: 36, lineSpacing: 48, maxLines: 2 };
    if (lineCount <= 3) return { fontSize: 32, lineSpacing: 42, maxLines: 3 };
    if (lineCount <= 4) return { fontSize: 28, lineSpacing: 36, maxLines: 4 };
    if (lineCount <= 5) return { fontSize: 26, lineSpacing: 32, maxLines: 5 };
    if (lineCount <= 6) return { fontSize: 24, lineSpacing: 30, maxLines: 6 };
    return { fontSize: 22, lineSpacing: 28, maxLines: 6 };
  }

  // Adaptive sizing presets for dual-language mode
  function getDualSizing(lineCount: number) {
    if (lineCount <= 2) return { primaryFontSize: 30, primarySpacing: 38, secondaryFontSize: 22, secondarySpacing: 30, maxLines: 2 };
    if (lineCount <= 3) return { primaryFontSize: 26, primarySpacing: 34, secondaryFontSize: 20, secondarySpacing: 28, maxLines: 3 };
    if (lineCount <= 4) return { primaryFontSize: 24, primarySpacing: 30, secondaryFontSize: 18, secondarySpacing: 26, maxLines: 4 };
    return { primaryFontSize: 22, primarySpacing: 28, secondaryFontSize: 16, secondarySpacing: 24, maxLines: 4 };
  }

  for (const section of primaryVariant.sections) {
    const totalLines = section.lines.length;
    if (totalLines === 0) continue;

    const isParallel = Boolean(secondaryVariant && secondaryLinesMap[section.type]);

    // Determine max lines per slide and sizing based on section line count
    const singleSizing = getSingleSizing(totalLines);
    const dualSizing = getDualSizing(totalLines);
    const maxLines = isParallel ? dualSizing.maxLines : singleSizing.maxLines;

    const chunkCount = Math.ceil(totalLines / maxLines);

    for (let chunkIdx = 0; chunkIdx < chunkCount; chunkIdx++) {
      const slide = pptx.addSlide();
      slide.background = { color: PALETTE.bg };

      // Header at top center
      const headerLabel =
        chunkCount > 1
          ? `${section.label.toUpperCase()} (${chunkIdx + 1}/${chunkCount})`
          : section.label.toUpperCase();

      slide.addText(headerLabel, {
        x: 0.5,
        y: 0.3,
        w: 9.0,
        h: 0.4,
        align: "center",
        fontSize: 11,
        color: PALETTE.textMuted,
        bold: true,
      });

      // Extract lines for this slide chunk
      const startLineIdx = chunkIdx * maxLines;
      const chunkLines = section.lines.slice(
        startLineIdx,
        startLineIdx + maxLines
      );

      // Re-calculate sizing for this specific chunk's line count
      const chunkLineCount = chunkLines.length;

      if (isParallel) {
        // ── Dual / Parallel Mode: Native Block + Transliteration Block ──
        const chunkDualSizing = getDualSizing(chunkLineCount);

        const primaryBlock = chunkLines
          .map((line) => line.tokens.map((t) => t.text).join("").trim())
          .join("\n");

        const secondaryBlock = chunkLines
          .map(
            (line, idx) =>
              secondaryLinesMap[section.type]?.[startLineIdx + idx]?.trim() || ""
          )
          .filter(Boolean)
          .join("\n");

        const textRuns: pptxgen.TextProps[] = [
          {
            text: primaryBlock + (secondaryBlock ? "\n\n" : ""),
            options: {
              fontSize: chunkDualSizing.primaryFontSize,
              color: PALETTE.primary,
              bold: true,
              align: "center",
              lineSpacing: chunkDualSizing.primarySpacing,
            },
          },
        ];

        if (secondaryBlock) {
          textRuns.push({
            text: secondaryBlock,
            options: {
              fontSize: chunkDualSizing.secondaryFontSize,
              color: PALETTE.primary,
              bold: true,
              align: "center",
              lineSpacing: chunkDualSizing.secondarySpacing,
            },
          });
        }

        slide.addText(textRuns, {
          x: 0.5,
          y: 0.8,
          w: 9.0,
          h: 4.4,
          align: "center",
          valign: "middle",
        });
      } else {
        // ── Single Language Mode ──
        const chunkSingleSizing = getSingleSizing(chunkLineCount);

        const plainText = chunkLines
          .map((line) => line.tokens.map((t) => t.text).join("").trim())
          .join("\n");

        slide.addText(plainText, {
          x: 0.5,
          y: 0.8,
          w: 9.0,
          h: 4.4,
          align: "center",
          valign: "middle",
          fontSize: chunkSingleSizing.fontSize,
          color: PALETTE.primary,
          bold: true,
          lineSpacing: chunkSingleSizing.lineSpacing,
        });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // SLIDE END: Closing Slide
  // ═══════════════════════════════════════════════════════════
  const endSlide = pptx.addSlide();
  endSlide.background = { color: PALETTE.bg };
  endSlide.addText("WeWorship", {
    x: 0.5,
    y: 2.0,
    w: 9.0,
    h: 1.6,
    align: "center",
    valign: "middle",
    fontSize: 32,
    color: PALETTE.accent,
    bold: true,
  });

  const result = await pptx.write({ outputType: "nodebuffer" });
  return result as Buffer;
}
