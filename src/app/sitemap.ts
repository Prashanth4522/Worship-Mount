import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://weworship.org";

const LANGUAGES = ["kannada", "tamil", "telugu", "malayalam", "hindi", "english"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Language browse routes
  const languageRoutes: MetadataRoute.Sitemap = LANGUAGES.map((lang) => ({
    url: `${BASE_URL}/languages/${lang}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Fetch published songs
  const songs = await prisma.song.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const songRoutes: MetadataRoute.Sitemap = songs.map((song) => ({
    url: `${BASE_URL}/songs/${song.slug}`,
    lastModified: song.updatedAt.toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Fetch artists
  const artists = await prisma.artist.findMany({
    select: { slug: true },
  });

  const artistRoutes: MetadataRoute.Sitemap = artists.map((artist) => ({
    url: `${BASE_URL}/artists/${artist.slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Fetch categories
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categories/${cat.slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...languageRoutes,
    ...songRoutes,
    ...artistRoutes,
    ...categoryRoutes,
  ];
}
