import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

import { AdminPageHeader } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveAdminLanding } from "@/lib/admin/section-redirect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { hasPermission } from "@/lib/auth/session";
import { getDb } from "@/lib/cloudflare-env";
import { formatRelativeTime } from "@/lib/format-relative-time";

type ActivityItem = {
  id: string;
  type: "lead" | "application";
  name: string;
  email: string;
  at: Date;
  href: string;
  statusLabel: string;
  statusVariant: "unread" | "new" | "read" | "default";
};

export default async function AdminDashboard() {
  const session = await requireAdmin();
  // The dashboard is a content-and-inbox overview. Anyone without cms.view
  // (hr, employee, a narrow custom role) is bounced to their first permitted
  // screen; editor/admin/super_admin keep it.
  if (!hasPermission(session, "cms.view")) {
    redirect(resolveAdminLanding(session));
  }

  const prisma = await getDb();
  // Rolling 7 days from this request, not a calendar week.
  const weekAgo = new Date();
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

  const [
    leadCount,
    unreadCount,
    weekCount,
    pendingApps,
    publishedPosts,
    draftPosts,
    recentLeads,
    recentApps,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { read: false } }),
    prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.jobApplication.count({ where: { status: "new" } }),
    prisma.blogPost.count({ where: { status: "published" } }),
    prisma.blogPost.count({ where: { status: "draft" } }),
    prisma.lead.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, read: true, createdAt: true },
    }),
    prisma.jobApplication.findMany({
      take: 8,
      orderBy: { submittedAt: "desc" },
      select: { id: true, name: true, email: true, status: true, submittedAt: true },
    }),
  ]);

  const activity: ActivityItem[] = [
    ...recentLeads.map((lead) => ({
      id: lead.id,
      type: "lead" as const,
      name: lead.name?.trim() || "Untitled lead",
      email: lead.email?.trim() || "—",
      at: lead.createdAt,
      href: `/admin/submissions?highlight=${encodeURIComponent(lead.id)}`,
      statusLabel: lead.read ? "read" : "unread",
      statusVariant: lead.read ? ("read" as const) : ("unread" as const),
    })),
    ...recentApps.map((app) => ({
      id: app.id,
      type: "application" as const,
      name: app.name,
      email: app.email,
      at: app.submittedAt,
      href: `/admin/careers/applications?highlight=${encodeURIComponent(app.id)}`,
      statusLabel: app.status,
      statusVariant: app.status === "new" ? ("new" as const) : ("default" as const),
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const canCreate = hasPermission(session, "content.create");
  const canEdit = hasPermission(session, "content.edit");
  const canManageUsers = hasPermission(session, "users.manage");

  return (
    <div className="mx-auto max-w-[1400px]" data-admin-overview>
      <AdminPageHeader title="Dashboard" description="Inbound work and content at a glance." />

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard href="/admin/submissions" label="Total submissions" value={String(leadCount)}>
          {unreadCount > 0 ? <Badge variant="unread">{unreadCount} unread</Badge> : <Badge variant="read">All read</Badge>}
        </MetricCard>

        <MetricCard href="/admin/submissions" label="New leads this week" value={String(weekCount)}>
          <span className="text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">This week</span>
        </MetricCard>

        <MetricCard href="/admin/careers/applications?status=new" label="Applications pending review">
          {pendingApps > 0 ? (
            <>
              <p className="text-4xl font-medium">{pendingApps}</p>
              <Badge variant="new">{pendingApps} new</Badge>
            </>
          ) : (
            <p className="text-sm text-[var(--diq_mid)]">No new applications</p>
          )}
        </MetricCard>

        <MetricCard href="/admin/blog" label="Content">
          <p className="text-lg font-medium">
            {publishedPosts} published · {draftPosts} draft
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="published">{publishedPosts} published</Badge>
            <Badge variant="draft">{draftPosts} draft</Badge>
          </div>
        </MetricCard>
      </section>

      <section className="mt-10" aria-labelledby="recent-activity-heading">
        <h2 id="recent-activity-heading" className="mb-4 font-sans text-lg font-medium">
          Recent activity
        </h2>
        {activity.length === 0 ? (
          <div className="rounded-xl border border-[var(--diq_border)] bg-[var(--diq_surface)] px-6 py-10 text-sm text-[var(--diq_mid)]">
            No recent activity
          </div>
        ) : (
          <ul className="divide-y divide-[var(--diq_border)] overflow-hidden rounded-xl border border-[var(--diq_border)] bg-[var(--card)]">
            {activity.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  href={item.href}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--diq_panel)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ring)]"
                >
                  <Badge variant={item.type === "lead" ? "lead" : "application"}>
                    {item.type === "lead" ? "Lead" : "Application"}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
                  <span className="truncate text-sm text-[var(--diq_mid)]">{item.email}</span>
                  <Badge variant={item.statusVariant}>{item.statusLabel}</Badge>
                  <time className="text-xs text-[var(--diq_mid)]" dateTime={item.at.toISOString()}>
                    {formatRelativeTime(item.at)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="mb-4 font-sans text-lg font-medium">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {canCreate ? (
            <Button asChild variant="primary" size="admin">
              <Link href="/admin/careers/openings/new">Add job opening</Link>
            </Button>
          ) : null}
          <Button asChild variant="primary" size="admin">
            <Link href="/admin/careers/applications?status=new">Review new applications</Link>
          </Button>
          {canEdit ? (
            <Button asChild variant="secondary" size="admin">
              <Link href="/admin/home/hero">Edit homepage hero</Link>
            </Button>
          ) : null}
          {canManageUsers ? (
            <Button asChild variant="secondary" size="admin">
              <Link href="/admin/settings/users">Manage users</Link>
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  href,
  label,
  value,
  children,
}: {
  href: string;
  label: string;
  value?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-xl border border-[var(--diq_border)] bg-[var(--card)] p-6 transition-colors hover:border-[var(--gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
    >
      <p className="font-mono text-sm uppercase tracking-wide text-[var(--diq_mid)]">{label}</p>
      {value ? <p className="text-4xl font-medium">{value}</p> : null}
      {children}
    </Link>
  );
}
