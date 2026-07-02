import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";

export default async function AdminDashboard() {
  const prisma = await getDb();
  await requireAdmin();
  const leadCount = await prisma.lead.count();

  return (
    <div>
      <h1 className="font-sans text-2xl font-medium mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-[var(--diq_border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--diq_mid)] mb-2 font-mono tracking-wide uppercase">Total Submissions</p>
          <p className="text-4xl font-medium">{leadCount}</p>
        </div>
      </div>

      <h2 className="font-sans text-lg font-medium mt-12 mb-4">Sections</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          ["Submissions", "/admin/submissions"],
          ["Home", "/admin/home"],
          ["About", "/admin/about"],
          ["Services", "/admin/services"],
          ["How We Work", "/admin/process"],
          ["Industries", "/admin/industries"],
          ["Story", "/admin/story"],
          ["Contact", "/admin/contact"],
          ["Site Settings", "/admin/site-settings"],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="rounded-lg border border-[var(--diq_border)] bg-[var(--card)] px-4 py-3 text-sm hover:border-[var(--gold)] transition-colors"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
