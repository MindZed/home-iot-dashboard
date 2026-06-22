// prisma/seed.ts
// Seeds the database with an initial admin user.
// Reads AUTH_USERNAME and AUTH_PASSWORD from .env.local.
// Safe to run multiple times — uses upsert.

import * as dotenv from "dotenv";
import path from "node:path";
import bcrypt from "bcryptjs";

// Load .env.local explicitly since we are running via tsx
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import the configured Prisma Client instance
import { prisma } from "../lib/db";

async function main() {
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;

  if (!username || !password) {
    console.error("❌ AUTH_USERNAME and AUTH_PASSWORD must be set in .env.local");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`✅ Admin user seeded: ${user.username} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
