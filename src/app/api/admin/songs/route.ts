import { prisma } from "@/lib/prisma";
import { parseChordProSong } from "@/lib/chordpro-parser";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

    if (!titleEn || typeof titleEn !== "string") {
      return NextResponse.json(
        { error: "English Title (titleEn) is required" },
        { status: 400 }
      );
    }

    if (!originalLanguage || !originalKey) {
      return NextResponse.json(
        { error: "Original Language and Key are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = titleEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const langSuffix = originalLanguage.toLowerCase();
    if (!baseSlug.includes(langSuffix)) {
      baseSlug = `${baseSlug}-${langSuffix}-lyrics-chords`;
    }

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.song.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create Song in database
    const song = await prisma.song.create({
      data: {
        slug,
        titleEn,
        originalLanguage,
        originalKey,
        ccliOrSource: ccliOrSource || null,
        status: status || "PUBLISHED",
        tags: Array.isArray(tags) ? tags.join(",") : tags || null,
        songArtists: {
          create: (artistIds || []).map((artistId: string) => ({
            artistId,
          })),
        },
        songCategories: {
          create: (categoryIds || []).map((categoryId: string) => ({
            categoryId,
          })),
        },
      },
    });

    // Create Variants, Sections, and Lines
    if (Array.isArray(variants)) {
      for (let vIdx = 0; vIdx < variants.length; vIdx++) {
        const v = variants[vIdx];
        const parsedSections = parseChordProSong(v.chordProText || "");

        const createdVariant = await prisma.songVariant.create({
          data: {
            songId: song.id,
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

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    console.error("Error creating song:", error);
    return NextResponse.json(
      { error: "Failed to create song" },
      { status: 500 }
    );
  }
}
