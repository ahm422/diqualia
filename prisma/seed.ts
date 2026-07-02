import "dotenv/config";
import bcrypt from "bcrypt";
import { getPlatformProxy } from "wrangler";

import { createPrismaClient } from "../lib/prisma-core";
import { seedCms } from "./seed-cms";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user");
  }

  const { env, dispose } = await getPlatformProxy<Env>();
  const prisma = createPrismaClient(env.DB);

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });
    console.log(`Admin user ready: ${admin.email} (id: ${admin.id})`);

    const existing = await prisma.lead.findFirst({ where: { source: "seed" } });
    if (!existing) {
      await prisma.lead.create({
        data: {
          email: "dev-seed@example.com",
          name: "Dev seed lead",
          message: "Remove me — created by prisma/seed.ts",
          source: "seed",
        },
      });
      console.log("Test lead created");
    }

    await seedCms(prisma);
  } finally {
    await prisma.$disconnect();
    await dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
