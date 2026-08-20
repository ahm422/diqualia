import Link from "next/link";

import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { Button } from "@/components/ui/button";

import { UsersList, type AdminUserRow } from "./UsersList";

export default async function AdminUsersPage() {
  const prisma = await getDb();
  await requirePermission("users.manage");

  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      roleId: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { id: true, name: true, isSystem: true } },
    },
    orderBy: { email: "asc" },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-medium text-foreground">Users</h1>
          <p className="mt-1 text-sm text-[var(--diq_mid)]">
            CMS operators and the roles they are assigned.
          </p>
        </div>
        <Button asChild variant="secondary" size="admin" className="shrink-0">
          <Link href="/admin/settings/users/new">New user</Link>
        </Button>
      </div>
      <UsersList initialUsers={users as AdminUserRow[]} />
    </div>
  );
}
