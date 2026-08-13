import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Fetching all songs...");
  const songs = await prisma.song.findMany({
    include: {
      songArtists: {
        include: {
          artist: true,
        },
      },
    },
  });

  console.log(`Found ${songs.length} songs. Updating slugs...`);

  let updatedCount = 0;

  for (const song of songs) {
    const artistNames = song.songArtists
      .map((sa: any) => sa.artist.name)
      .join("-");

    let rawSlug = song.titleEn;
    if (artistNames) {
      rawSlug += `-${artistNames}`;
    }

    let baseSlug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const langSuffix = song.originalLanguage.toLowerCase();
    if (!baseSlug.includes(langSuffix)) {
      baseSlug = `${baseSlug}-${langSuffix}-lyrics-chords`;
    }

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.song.findUnique({ where: { slug } });
      if (!existing || existing.id === song.id) {
        break; 
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    if (slug !== song.slug) {
      await prisma.song.update({
        where: { id: song.id },
        data: { slug },
      });
      console.log(`Updated: ${song.slug} -> ${slug}`);
      updatedCount++;
    } else {
      console.log(`Skipped (already correct): ${song.slug}`);
    }
  }

  console.log(`\nMigration complete. Updated ${updatedCount} out of ${songs.length} songs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
