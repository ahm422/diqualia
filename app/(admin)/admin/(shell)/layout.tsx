import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminToaster } from "@/components/admin";

import { AdminSessionProvider } from "../AdminSessionProvider";
import { AdminMobileHeader, AdminSidebar } from "../AdminSidebar";

function AdminSidebarFallback() {
  return (
    <aside className="hidden h-full w-72 shrink-0 border-r border-[var(--diq_border)] bg-[var(--diq_deep)] min-[961px]:flex" />
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
        <div className="flex min-w-0 flex-1 flex-col">
          <Suspense fallback={<div className="h-14 shrink-0 border-b border-[var(--diq_border)] min-[961px]:hidden" />}>
            <AdminMobileHeader />
          </Suspense>
          <main className="min-h-0 flex-1 overflow-y-auto p-4 min-[961px]:p-8">{children}</main>
        </div>
        <AdminToaster />
      </div>
    </AdminSessionProvider>
  );
}
