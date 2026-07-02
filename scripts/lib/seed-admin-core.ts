import type { PrismaClient } from "@/lib/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";

/** Upsert the single CMS super-admin (must match ADMIN_EMAIL at login). */
export async function upsertAdminUser(
  prisma: PrismaClient,
  email: string,
  password: string,
) {
  const passwordHash = await hashPassword(password);
  return prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
}
