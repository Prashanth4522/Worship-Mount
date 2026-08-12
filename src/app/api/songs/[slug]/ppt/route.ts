import { prisma } from "@/lib/prisma";
import { generateSongPPT, PPTMode } from "@/lib/ppt-generator";
import { NextRequest, NextResponse } from "next/server";
import { SongData, VariantData, SectionData, LineData, Token } from "@/lib/types";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = request.nextUrl;

  const variantId = searchParams.get("variant") || "";
  const secondaryVariantId = searchParams.get("secondary") || "";
  const mode = (searchParams.get("mode") as PPTMode) || "single";

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

    const songData: SongData = {
      id: song.id,
      slug: song.slug,
      titleEn: song.titleEn,
      originalLanguage: song.originalLanguage as SongData["originalLanguage"],
      originalKey: song.originalKey,
      ccliOrSource: song.ccliOrSource,
      status: song.status as SongData["status"],
      tags: song.tags ? song.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      createdAt: song.createdAt.toISOString(),
      updatedAt: song.updatedAt.toISOString(),
      variants: song.variants.map(
        (v): VariantData => ({
          id: v.id,
          songId: v.songId,
          language: v.language as VariantData["language"],
          title: v.title,
          isPrimary: v.isPrimary,
          sections: v.sections.map(
            (s): SectionData => ({
              id: s.id,
              variantId: s.variantId,
              order: s.order,
              type: s.type as SectionData["type"],
              label: s.label,
              lines: s.lines.map(
                (l): LineData => ({
                  id: l.id,
                  sectionId: l.sectionId,
                  order: l.order,
                  tokens: parseTokens(l.tokens),
                })
              ),
            })
          ),
        })
      ),
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

    const buffer = await generateSongPPT({
      song: songData,
      variantId,
      secondaryVariantId,
      mode,
    });

    const filename = `${song.slug}-${mode}.pptx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Error generating PowerPoint presentation:", error);
    return NextResponse.json(
      { error: "Failed to generate PowerPoint presentation" },
      { status: 500 }
    );
  }
}
