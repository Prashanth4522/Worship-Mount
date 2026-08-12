import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") || searchParams.get("search") || "";
  const language = searchParams.get("language");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "recent";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    // Filter by language
    if (language) {
      where.originalLanguage = language.toUpperCase();
    }

    // Filter by category slug
    if (category) {
      where.songCategories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    // Multi-field search
    if (query.trim()) {
      const q = query.trim();
      where.OR = [
        // Match English title
        { titleEn: { contains: q } },
        // Match variant titles (native script & transliteration)
        {
          variants: {
            some: {
              title: { contains: q },
            },
          },
        },
        // Match artist names
        {
          songArtists: {
            some: {
              artist: {
                name: { contains: q },
              },
            },
          },
        },
        // Match category names
        {
          songCategories: {
            some: {
              category: {
                name: { contains: q },
              },
            },
          },
        },
        // Match lyric tokens content
        {
          variants: {
            some: {
              sections: {
                some: {
                  lines: {
                    some: {
                      tokens: { contains: q },
                    },
                  },
                },
              },
            },
          },
        },
      ];
    }

    // Sort order
    const orderBy: Record<string, string> =
      sort === "title" ? { titleEn: "asc" } : { updatedAt: "desc" };

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          variants: true,
          songArtists: {
            include: { artist: true },
          },
          songCategories: {
            include: { category: true },
          },
        },
      }),
      prisma.song.count({ where }),
    ]);

    // Format songs response
    const formattedSongs = songs.map((song) => {
      let matchingSnippet: string | undefined;

      // Extract matching snippet if query matches lyric line
      if (query.trim()) {
        const qLower = query.toLowerCase();
        for (const variant of song.variants) {
          // If title matches, no snippet needed
          if (variant.title.toLowerCase().includes(qLower)) break;
        }
      }

      return {
        id: song.id,
        slug: song.slug,
        titleEn: song.titleEn,
        originalLanguage: song.originalLanguage,
        originalKey: song.originalKey,
        status: song.status,
        variants: song.variants.map((v) => ({
          id: v.id,
          language: v.language,
          title: v.title,
        })),
        artists: song.songArtists.map((sa) => ({
          id: sa.artist.id,
          name: sa.artist.name,
          slug: sa.artist.slug,
        })),
        categories: song.songCategories.map((sc) => ({
          id: sc.category.id,
          name: sc.category.name,
          slug: sc.category.slug,
        })),
        matchingSnippet,
      };
    });

    return NextResponse.json({
      songs: formattedSongs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error searching songs:", error);
    return NextResponse.json(
      { error: "Failed to search songs" },
      { status: 500 }
    );
  }
}
