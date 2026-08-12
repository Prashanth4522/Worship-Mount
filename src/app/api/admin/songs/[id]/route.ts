import { prisma } from "@/lib/prisma";
import { parseChordProSong } from "@/lib/chordpro-parser";
import { NextRequest, NextResponse } from "next/server";
import { Token } from "@/lib/types";

function parseTokens(tokensRaw: string | Token[]): Token[] {
  if (typeof tokensRaw === "string") {
    try {
      return JSON.parse(tokensRaw);
    } catch {
      return [{ text: tokensRaw, chord: null }];
    }
  }
  return tokensRaw;
}

function tokensToChordProLine(tokens: Token[]): string {
  return tokens
    .map((t) => (t.chord ? `[${t.chord}]${t.text}` : t.text))
    .join("");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            sections: {
              orderBy: { order: "asc" },
              include: {
                lines: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
        songArtists: true,
        songCategories: true,
      },
    });

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Reconstruct raw ChordPro text for each variant for the admin editor
    const formattedVariants = song.variants.map((v) => {
      const chordProText = v.sections
        .map((sec) => {
          const linesText = sec.lines
            .map((l) => tokensToChordProLine(parseTokens(l.tokens)))
            .join("\n");
          return `[${sec.label}]\n${linesText}`;
        })
        .join("\n\n");

      return {
        id: v.id,
        language: v.language,
        title: v.title,
        isPrimary: v.isPrimary,
        chordProText,
      };
    });

    return NextResponse.json({
      song: {
        ...song,
        artistIds: song.songArtists.map((sa) => sa.artistId),
        categoryIds: song.songCategories.map((sc) => sc.categoryId),
        tagsList: song.tags ? song.tags.split(",").map((t) => t.trim()) : [],
        variants: formattedVariants,
      },
    });
  } catch (error) {
    console.error("Error fetching song details for admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch song details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const {
      titleEn,
      originalLanguage,
      originalKey,
      ccliOrSource,
      status,
      tags,
      artistIds,
      categoryIds,
      variants,
    } = body;

    const existing = await prisma.song.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Update song base fields
    const updatedSong = await prisma.song.update({
      where: { id },
      data: {
        titleEn,
        originalLanguage,
        originalKey,
        ccliOrSource: ccliOrSource || null,
        status: status || existing.status,
        tags: Array.isArray(tags) ? tags.join(",") : tags || null,
      },
    });

    // Update artists relation
    await prisma.songArtist.deleteMany({ where: { songId: id } });
    if (Array.isArray(artistIds) && artistIds.length > 0) {
      await prisma.songArtist.createMany({
        data: artistIds.map((artistId: string) => ({
          songId: id,
          artistId,
        })),
      });
    }

    // Update categories relation
    await prisma.songCategory.deleteMany({ where: { songId: id } });
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      await prisma.songCategory.createMany({
        data: categoryIds.map((categoryId: string) => ({
          songId: id,
          categoryId,
        })),
      });
    }

    // Re-create variants, sections, lines if provided
    if (Array.isArray(variants)) {
      // Delete existing variants (cascades sections and lines)
      await prisma.songVariant.deleteMany({ where: { songId: id } });

      for (let vIdx = 0; vIdx < variants.length; vIdx++) {
        const v = variants[vIdx];
        const parsedSections = parseChordProSong(v.chordProText || "");

        const createdVariant = await prisma.songVariant.create({
          data: {
            songId: id,
            language: v.language,
            title: v.title || titleEn,
            isPrimary: v.isPrimary ?? (vIdx === 0),
          },
        });

        for (let sIdx = 0; sIdx < parsedSections.length; sIdx++) {
          const sec = parsedSections[sIdx];
          const createdSection = await prisma.section.create({
            data: {
              variantId: createdVariant.id,
              order: sIdx + 1,
              type: sec.type,
              label: sec.label,
            },
          });

          for (let lIdx = 0; lIdx < sec.lines.length; lIdx++) {
            const lineTokens = sec.lines[lIdx];
            await prisma.line.create({
              data: {
                sectionId: createdSection.id,
                order: lIdx + 1,
                tokens: JSON.stringify(lineTokens),
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ song: updatedSong });
  } catch (error) {
    console.error("Error updating song:", error);
    return NextResponse.json(
      { error: "Failed to update song" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const existing = await prisma.song.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Delete song (Prisma schema cascade deletes variants, sections, lines, songArtists, songCategories)
    await prisma.song.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Song deleted" });
  } catch (error) {
    console.error("Error deleting song:", error);
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}
