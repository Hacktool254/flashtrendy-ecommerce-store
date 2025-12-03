import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy initialization to avoid build-time errors when DATABASE_URL is not available
function getPrismaClient() {
  // Check DATABASE_URL at runtime, not at module load time
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Enable SSL for production databases (Neon, AWS RDS, DigitalOcean, etc.)
  // Only disable SSL for local development databases that don't support it
  const isLocalDev = process.env.NODE_ENV === "development" && 
                     !databaseUrl.includes("neon.tech") &&
                     !databaseUrl.includes("amazonaws.com") &&
                     !databaseUrl.includes("digitalocean.com") &&
                     !databaseUrl.includes("supabase.co") &&
                     databaseUrl.includes("localhost");

  const pool = new Pool({
    connectionString: databaseUrl,
    // Enable SSL for all production databases, not just Neon
    ssl: isLocalDev ? undefined : {
      rejectUnauthorized: false,
    },
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;