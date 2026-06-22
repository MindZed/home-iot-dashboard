// prisma.config.ts
// Prisma v7 configuration — connection URLs moved here from schema.prisma.

import * as dotenv from "dotenv";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Explicitly load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: env("DIRECT_DATABASE_URL"),
  },

  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
});

