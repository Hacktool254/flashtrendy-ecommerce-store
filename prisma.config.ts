import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Load .env file from project root if it exists (for local development)
// On Vercel, environment variables are set directly, so .env file is not needed
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  config({ path: envPath });
}

// Only throw error if DATABASE_URL is missing (will be set by Vercel in production)
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Make sure it's configured in your environment variables.");
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

