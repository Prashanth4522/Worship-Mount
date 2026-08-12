/**
 * WeWorship — Seed Data
 * 
 * Seeds the database with 3 sample songs across multiple languages
 * to validate the token-based data model.
 */

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });


// Helper to JSON-stringify tokens for storage
function t(tokens: Array<{ text: string; chord: string | null }>): string {
  return JSON.stringify(tokens);
}

async function main() {
  console.log('🌱 Seeding WeWorship database...\n');

  // Clean existing records for fresh seed
  await prisma.line.deleteMany();
  await prisma.section.deleteMany();
  await prisma.songVariant.deleteMany();
  await prisma.songArtist.deleteMany();
  await prisma.songCategory.deleteMany();
  await prisma.song.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.category.deleteMany();

  // ─── Artists ───
  const artistJohnNewton = await prisma.artist.create({
    data: {
      name: 'John Newton',
      slug: 'john-newton',
      bio: 'English Anglican clergyman and abolitionist, author of Amazing Grace.',
    },
  });

  const artistUnknown = await prisma.artist.create({
    data: {
      name: 'Traditional',
      slug: 'traditional',
      bio: 'Traditional gospel and worship songs.',
    },
  });

  console.log('✅ Artists created');

  // ─── Categories ───
  const catWorship = await prisma.category.create({
    data: { name: 'Worship', slug: 'worship' },
  });
  const catPraise = await prisma.category.create({
    data: { name: 'Praise', slug: 'praise' },
  });
  const catHymns = await prisma.category.create({
    data: { name: 'Hymns', slug: 'hymns' },
  });
  const catTamil = await prisma.category.create({
    data: { name: 'Tamil Christian', slug: 'tamil-christian' },
  });
  const catKannada = await prisma.category.create({
    data: { name: 'Kannada Christian', slug: 'kannada-christian' },
  });

  console.log('✅ Categories created');

  // ═══════════════════════════════════════════════════════════
  // SONG 1: Amazing Grace (English)
  // ═══════════════════════════════════════════════════════════
  const song1 = await prisma.song.create({
    data: {
      slug: 'amazing-grace-lyrics-chords',
      titleEn: 'Amazing Grace',
      originalLanguage: 'EN',
      originalKey: 'G',
      ccliOrSource: 'Public Domain',
      status: 'PUBLISHED',
      tags: 'hymn,classic,worship',
      songArtists: {
        create: { artistId: artistJohnNewton.id },
      },
      songCategories: {
        create: [
          { categoryId: catWorship.id },
          { categoryId: catHymns.id },
        ],
      },
      variants: {
        create: [
          {
            language: 'EN',
            title: 'Amazing Grace',
            isPrimary: true,
            sections: {
              create: [
                {
                  order: 1,
                  type: 'VERSE',
                  label: 'Verse 1',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: 'Amazing ', chord: 'G' }, { text: 'grace, how ', chord: null }, { text: 'sweet the ', chord: 'C' }, { text: 'sound', chord: 'G' }]) },
                      { order: 2, tokens: t([{ text: 'That ', chord: null }, { text: 'saved a ', chord: 'G' }, { text: 'wretch like ', chord: null }, { text: 'me', chord: 'D' }]) },
                      { order: 3, tokens: t([{ text: 'I ', chord: 'G' }, { text: 'once was ', chord: null }, { text: 'lost, but ', chord: 'C' }, { text: 'now am ', chord: 'G' }, { text: 'found', chord: null }]) },
                      { order: 4, tokens: t([{ text: 'Was ', chord: null }, { text: 'blind but ', chord: 'Em' }, { text: 'now I ', chord: 'D' }, { text: 'see', chord: 'G' }]) },
                    ],
                  },
                },
                {
                  order: 2,
                  type: 'VERSE',
                  label: 'Verse 2',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: "'Twas ", chord: 'G' }, { text: 'grace that ', chord: null }, { text: 'taught my ', chord: 'C' }, { text: 'heart to ', chord: 'G' }, { text: 'fear', chord: null }]) },
                      { order: 2, tokens: t([{ text: 'And ', chord: null }, { text: 'grace my ', chord: 'G' }, { text: 'fears re', chord: null }, { text: 'lieved', chord: 'D' }]) },
                      { order: 3, tokens: t([{ text: 'How ', chord: 'G' }, { text: 'precious ', chord: null }, { text: 'did that ', chord: 'C' }, { text: 'grace ap', chord: 'G' }, { text: 'pear', chord: null }]) },
                      { order: 4, tokens: t([{ text: 'The ', chord: null }, { text: 'hour I ', chord: 'Em' }, { text: 'first be', chord: 'D' }, { text: 'lieved', chord: 'G' }]) },
                    ],
                  },
                },
                {
                  order: 3,
                  type: 'VERSE',
                  label: 'Verse 3',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: 'Through ', chord: 'G' }, { text: 'many ', chord: null }, { text: 'dangers, ', chord: 'C' }, { text: 'toils, and ', chord: 'G' }, { text: 'snares', chord: null }]) },
                      { order: 2, tokens: t([{ text: 'I ', chord: null }, { text: 'have al', chord: 'G' }, { text: 'ready ', chord: null }, { text: 'come', chord: 'D' }]) },
                      { order: 3, tokens: t([{ text: "'Tis ", chord: 'G' }, { text: 'grace hath ', chord: null }, { text: 'brought me ', chord: 'C' }, { text: 'safe thus ', chord: 'G' }, { text: 'far', chord: null }]) },
                      { order: 4, tokens: t([{ text: 'And ', chord: null }, { text: 'grace will ', chord: 'Em' }, { text: 'lead me ', chord: 'D' }, { text: 'home', chord: 'G' }]) },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Song 1: Amazing Grace (EN)');

  // ═══════════════════════════════════════════════════════════
  // SONG 2: Yesuve Nee Enakku (Tamil native + Tanglish transliterated)
  // A popular Tamil worship song
  // ═══════════════════════════════════════════════════════════
  const song2 = await prisma.song.create({
    data: {
      slug: 'yesuve-nee-enakku-tamil-lyrics-chords',
      titleEn: 'Yesuve Nee Enakku',
      originalLanguage: 'TA',
      originalKey: 'C',
      status: 'PUBLISHED',
      tags: 'worship,tamil,devotional',
      songArtists: {
        create: { artistId: artistUnknown.id },
      },
      songCategories: {
        create: [
          { categoryId: catWorship.id },
          { categoryId: catTamil.id },
        ],
      },
      variants: {
        create: [
          // Tamil native script
          {
            language: 'TA',
            title: 'யேசுவே நீ எனக்கு',
            isPrimary: true,
            sections: {
              create: [
                {
                  order: 1,
                  type: 'CHORUS',
                  label: 'Chorus',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: 'யேசுவே ', chord: 'C' }, { text: 'நீ எனக்கு ', chord: 'Am' }, { text: 'போதும்', chord: 'F' }]) },
                      { order: 2, tokens: t([{ text: 'உன் ', chord: 'G' }, { text: 'அன்பு ', chord: 'C' }, { text: 'எனக்கு ', chord: 'F' }, { text: 'போதும்', chord: 'G' }]) },
                      { order: 3, tokens: t([{ text: 'நீ இல்', chord: 'Am' }, { text: 'லாமல் ', chord: 'Em' }, { text: 'நான் இல்லை', chord: 'F' }]) },
                      { order: 4, tokens: t([{ text: 'நீயே ', chord: 'G' }, { text: 'எனக்கு ', chord: 'Am' }, { text: 'எல்லாம்', chord: 'C' }]) },
                    ],
                  },
                },
                {
                  order: 2,
                  type: 'VERSE',
                  label: 'Verse 1',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: 'உன் ', chord: 'C' }, { text: 'கரங்கள் ', chord: 'Em' }, { text: 'என்னை ', chord: 'Am' }, { text: 'தாங்கும்', chord: null }]) },
                      { order: 2, tokens: t([{ text: 'உன் ', chord: 'F' }, { text: 'வார்த்தை ', chord: 'C' }, { text: 'என்னை ', chord: 'Dm' }, { text: 'நடத்தும்', chord: 'G' }]) },
                      { order: 3, tokens: t([{ text: 'உன் ', chord: 'Am' }, { text: 'ஆவி ', chord: 'Em' }, { text: 'என்னில் ', chord: 'F' }, { text: 'வாசம்', chord: null }]) },
                      { order: 4, tokens: t([{ text: 'உன் ', chord: 'Dm' }, { text: 'அன்பு ', chord: 'G' }, { text: 'என்றும் ', chord: 'C' }, { text: 'நிலையாம்', chord: null }]) },
                    ],
                  },
                },
              ],
            },
          },
          // Tanglish (transliterated)
          {
            language: 'TA_TRANSLIT',
            title: 'Yesuve Nee Enakku',
            isPrimary: false,
            sections: {
              create: [
                {
                  order: 1,
                  type: 'CHORUS',
                  label: 'Chorus',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: 'Yesuve ', chord: 'C' }, { text: 'nee enakku ', chord: 'Am' }, { text: 'podhum', chord: 'F' }]) },
                      { order: 2, tokens: t([{ text: 'Un ', chord: 'G' }, { text: 'anbu ', chord: 'C' }, { text: 'enakku ', chord: 'F' }, { text: 'podhum', chord: 'G' }]) },
                      { order: 3, tokens: t([{ text: 'Nee il', chord: 'Am' }, { text: 'laamal ', chord: 'Em' }, { text: 'naan illai', chord: 'F' }]) },
                      { order: 4, tokens: t([{ text: 'Neeyae ', chord: 'G' }, { text: 'enakku ', chord: 'Am' }, { text: 'ellaam', chord: 'C' }]) },
                    ],
                  },
                },
                {
                  order: 2,
                  type: 'VERSE',
                  label: 'Verse 1',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: 'Un ', chord: 'C' }, { text: 'karangal ', chord: 'Em' }, { text: 'ennai ', chord: 'Am' }, { text: 'thaangum', chord: null }]) },
                      { order: 2, tokens: t([{ text: 'Un ', chord: 'F' }, { text: 'vaarthai ', chord: 'C' }, { text: 'ennai ', chord: 'Dm' }, { text: 'nadathum', chord: 'G' }]) },
                      { order: 3, tokens: t([{ text: 'Un ', chord: 'Am' }, { text: 'aavi ', chord: 'Em' }, { text: 'ennil ', chord: 'F' }, { text: 'vaasam', chord: null }]) },
                      { order: 4, tokens: t([{ text: 'Un ', chord: 'Dm' }, { text: 'anbu ', chord: 'G' }, { text: 'endrum ', chord: 'C' }, { text: 'nilaiyaam', chord: null }]) },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Song 2: Yesuve Nee Enakku (TA + TA_TRANSLIT)');

  // ═══════════════════════════════════════════════════════════
  // SONG 3: Yesu Ninna Namadalli (Kannada + Eng-Kannada)
  // A Kannada worship song
  // ═══════════════════════════════════════════════════════════
  const song3 = await prisma.song.create({
    data: {
      slug: 'yesu-ninna-namadalli-kannada-lyrics-chords',
      titleEn: 'Yesu Ninna Namadalli',
      originalLanguage: 'KN',
      originalKey: 'D',
      status: 'PUBLISHED',
      tags: 'worship,kannada,praise',
      songArtists: {
        create: { artistId: artistUnknown.id },
      },
      songCategories: {
        create: [
          { categoryId: catPraise.id },
          { categoryId: catKannada.id },
        ],
      },
      variants: {
        create: [
          // Kannada native script
          {
            language: 'KN',
            title: 'ಯೇಸು ನಿನ್ನ ನಾಮದಲ್ಲಿ',
            isPrimary: true,
            sections: {
              create: [
                {
                  order: 1,
                  type: 'CHORUS',
                  label: 'Chorus',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: 'ಯೇಸು ', chord: 'D' }, { text: 'ನಿನ್ನ ', chord: null }, { text: 'ನಾಮ', chord: 'G' }, { text: 'ದಲ್ಲಿ', chord: null }]) },
                      { order: 2, tokens: t([{ text: 'ಜಯ ', chord: 'A' }, { text: 'ಜಯ ', chord: null }, { text: 'ಜಯ', chord: 'D' }]) },
                      { order: 3, tokens: t([{ text: 'ಸ್ತೋತ್ರ ', chord: 'G' }, { text: 'ಮಹಿಮೆ ', chord: 'D' }, { text: 'ನಿನಗೆ', chord: 'A' }]) },
                      { order: 4, tokens: t([{ text: 'ಎಂದೆಂ', chord: 'Bm' }, { text: 'ದಿಗೂ ', chord: 'G' }, { text: 'ಆಮೆನ್', chord: 'A' }, { text: '', chord: 'D' }]) },
                    ],
                  },
                },
                {
                  order: 2,
                  type: 'VERSE',
                  label: 'Verse 1',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: 'ನಿನ್ನ ', chord: 'D' }, { text: 'ಪ್ರೀತಿ ', chord: 'Bm' }, { text: 'ಎಷ್ಟು ', chord: 'G' }, { text: 'ದೊಡ್ಡದು', chord: null }]) },
                      { order: 2, tokens: t([{ text: 'ನಿನ್ನ ', chord: 'A' }, { text: 'ಕೃಪೆ ', chord: 'D' }, { text: 'ಎಷ್ಟು ', chord: 'G' }, { text: 'ಹೆಚ್ಚು', chord: 'A' }]) },
                      { order: 3, tokens: t([{ text: 'ಸಮ', chord: 'Bm' }, { text: 'ಸ್ತವನ್ನೂ ', chord: 'G' }, { text: 'ಬಿಟ್ಟು ', chord: 'D' }, { text: 'ಬಂದೆ', chord: null }]) },
                      { order: 4, tokens: t([{ text: 'ನನ್ನ ', chord: 'G' }, { text: 'ಬಳಿಗೆ ', chord: 'A' }, { text: 'ಬಂದೆ', chord: 'D' }]) },
                    ],
                  },
                },
              ],
            },
          },
          // Eng-Kannada (transliterated)
          {
            language: 'KN_TRANSLIT',
            title: 'Yesu Ninna Namadalli',
            isPrimary: false,
            sections: {
              create: [
                {
                  order: 1,
                  type: 'CHORUS',
                  label: 'Chorus',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: 'Yesu ', chord: 'D' }, { text: 'ninna ', chord: null }, { text: 'naama', chord: 'G' }, { text: 'dalli', chord: null }]) },
                      { order: 2, tokens: t([{ text: 'Jaya ', chord: 'A' }, { text: 'jaya ', chord: null }, { text: 'jaya', chord: 'D' }]) },
                      { order: 3, tokens: t([{ text: 'Sthotra ', chord: 'G' }, { text: 'mahime ', chord: 'D' }, { text: 'ninage', chord: 'A' }]) },
                      { order: 4, tokens: t([{ text: 'Enden', chord: 'Bm' }, { text: 'digoo ', chord: 'G' }, { text: 'amen', chord: 'A' }, { text: '', chord: 'D' }]) },
                    ],
                  },
                },
                {
                  order: 2,
                  type: 'VERSE',
                  label: 'Verse 1',
                  lines: {
                    create: [
                      { order: 1, tokens: t([{ text: 'Ninna ', chord: 'D' }, { text: 'preethi ', chord: 'Bm' }, { text: 'eshtu ', chord: 'G' }, { text: 'doddadu', chord: null }]) },
                      { order: 2, tokens: t([{ text: 'Ninna ', chord: 'A' }, { text: 'krupe ', chord: 'D' }, { text: 'eshtu ', chord: 'G' }, { text: 'hechchu', chord: 'A' }]) },
                      { order: 3, tokens: t([{ text: 'Sama', chord: 'Bm' }, { text: 'stavannoo ', chord: 'G' }, { text: 'bittu ', chord: 'D' }, { text: 'bande', chord: null }]) },
                      { order: 4, tokens: t([{ text: 'Nanna ', chord: 'G' }, { text: 'balige ', chord: 'A' }, { text: 'bande', chord: 'D' }]) },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Song 3: Yesu Ninna Namadalli (KN + KN_TRANSLIT)');

  console.log('\n🎉 Seed complete! Created 3 songs, 2 artists, 5 categories.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
