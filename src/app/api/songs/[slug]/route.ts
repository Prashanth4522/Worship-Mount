import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/songs/[slug]
 * Fetches a single song by slug with all variants, sections, and lines.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const song = await prisma.song.findUnique({
      where: { slug },
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
        songArtists: {
          include: { artist: true },
        },
        songCategories: {
          include: { category: true },
        },
      },
    });

    if (!song) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    // Parse tokens from JSON strings
    const response = {
      id: song.id,
      slug: song.slug,
      titleEn: song.titleEn,
      originalLanguage: song.originalLanguage,
      originalKey: song.originalKey,
      ccliOrSource: song.ccliOrSource,
      status: song.status,
      tags: song.tags ? song.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      createdAt: song.createdAt.toISOString(),
      updatedAt: song.updatedAt.toISOString(),
      variants: song.variants.map((v) => ({
        id: v.id,
        songId: v.songId,
        language: v.language,
        title: v.title,
        isPrimary: v.isPrimary,
        sections: v.sections.map((s) => ({
          id: s.id,
          variantId: s.variantId,
          order: s.order,
          type: s.type,
          label: s.label,
          lines: s.lines.map((l) => ({
            id: l.id,
            sectionId: l.sectionId,
            order: l.order,
            tokens: typeof l.tokens === "string" ? JSON.parse(l.tokens) : l.tokens,
          })),
        })),
      })),
      artists: song.songArtists.map((sa) => ({
        id: sa.artist.id,
        name: sa.artist.name,
        slug: sa.artist.slug,
        bio: sa.artist.bio,
        image: sa.artist.image,
      })),
      categories: song.songCategories.map((sc) => ({
        id: sc.category.id,
        name: sc.category.name,
        slug: sc.category.slug,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching song:", error);
    return NextResponse.json(
      { error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}
