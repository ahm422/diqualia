import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminToaster } from "@/components/admin";

import { AdminSessionProvider } from "../AdminSessionProvider";
import { AdminSidebar } from "../AdminSidebar";

function AdminSidebarFallback() {
  return (
    <aside className="h-full w-72 shrink-0 border-r border-[var(--diq_border)] bg-[var(--diq_deep)]" />
  );
}

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <AdminSessionProvider session={session}>
      <div className="flex h-screen overflow-hidden">
        <Suspense fallback={<AdminSidebarFallback />}>
          <AdminSidebar />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
        <AdminToaster />
      </div>
    </AdminSessionProvider>
  );
}
