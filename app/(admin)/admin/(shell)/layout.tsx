import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminSidebar } from "../AdminSidebar";
import { AdminToaster } from "@/components/admin";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
      <AdminToaster />
    </div>
  );
}
