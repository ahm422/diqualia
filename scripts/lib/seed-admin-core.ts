import type { PrismaClient } from "@/lib/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { ROLE_IDS } from "@/lib/auth/rbac-ids";

/** Upsert the bootstrap CMS super-admin (ADMIN_EMAIL). Does not demote an existing role. */
export async function upsertAdminUser(
  prisma: PrismaClient,
  email: string,
  password: string,
) {
  const passwordHash = await hashPassword(password);
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existing) {
    return prisma.adminUser.update({
      where: { email },
      data: {
        passwordHash,
        ...(existing.roleId ? {} : { roleId: ROLE_IDS.super_admin }),
      },
    });
  }

  return prisma.adminUser.create({
    data: {
      email,
      name: "Super admin",
      passwordHash,
      roleId: ROLE_IDS.super_admin,
    },
  });
}
