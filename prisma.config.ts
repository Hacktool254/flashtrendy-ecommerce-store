import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

// Load .env file from project root
const envPath = resolve(process.cwd(), ".env");
const result = config({ path: envPath });

if (!process.env.DATABASE_URL) {
  if (!existsSync(envPath)) {
    throw new Error(`.env file not found at: ${envPath}`);
  }
  const envContent = readFileSync(envPath, "utf-8");
  if (!envContent.includes("DATABASE_URL")) {
    throw new Error(`DATABASE_URL not found in .env file. File content:\n${envContent.substring(0, 200)}`);
  }
  throw new Error(`DATABASE_URL is empty or not properly formatted in .env file. Make sure it's in the format: DATABASE_URL="postgresql://..."`);
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

