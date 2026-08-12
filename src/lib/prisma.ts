/**
 * WeWorship — Prisma Client Singleton (Prisma v7 + PostgreSQL adapter)
 * 
 * Uses @prisma/adapter-pg driver adapter for PostgreSQL (Supabase).
 * Prevents connection pool exhaustion during Next.js hot reload.
 */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
