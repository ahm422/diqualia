import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export default async function SubmissionsPage() {
  await requireAdmin();
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-sans text-2xl font-medium mb-8">Submissions</h1>
      {leads.length === 0 ? (
        <p className="text-[var(--diq_mid)] text-sm">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--diq_border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--diq_border)] bg-[var(--diq_deep)]">
                <th className="text-left px-4 py-3 text-[var(--diq_mid)] font-medium">Name</th>
                <th className="text-left px-4 py-3 text-[var(--diq_mid)] font-medium">Email</th>
                <th className="text-left px-4 py-3 text-[var(--diq_mid)] font-medium">Message</th>
                <th className="text-left px-4 py-3 text-[var(--diq_mid)] font-medium">Source</th>
                <th className="text-left px-4 py-3 text-[var(--diq_mid)] font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-[var(--diq_border2)] last:border-0 hover:bg-[var(--diq_panel)] transition-colors"
                >
                  <td className="px-4 py-3">{lead.name ?? "—"}</td>
                  <td className="px-4 py-3">{lead.email ?? "—"}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-[var(--diq_mid)]">
                    {lead.message ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--diq_mid)]">
                    {lead.source ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--diq_mid)] whitespace-nowrap">
                    {lead.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
