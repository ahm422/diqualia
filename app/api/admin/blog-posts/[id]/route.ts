import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { hasPermission } from "@/lib/auth/session";
import { getDb } from "@/lib/cloudflare-env";
import { blogPostPatchSchema } from "@/lib/schemas/admin/blog";
import { revalidateBlogPost, revalidatePage } from "@/lib/revalidate-site";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("content.edit");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = blogPostPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    parsed.data.status === "published" &&
    existing.status !== "published" &&
    !hasPermission(session, "content.publish")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const conflict = await prisma.blogPost.findFirst({
      where: { slug: parsed.data.slug, id: { not: id } },
    });
    if (conflict) {
      return NextResponse.json({ error: "slug already exists" }, { status: 400 });
    }
  }

  const nextStatus = parsed.data.status ?? existing.status;
  const data: {
    slug?: string;
    title?: string;
    excerpt?: string;
    body?: string;
    coverImageUrl?: string | null;
    status?: string;
    publishedAt?: Date | null;
  } = { ...parsed.data };

  // On transition to published: set publishedAt if null. Keep publishedAt on unpublish.
  if (nextStatus === "published" && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  try {
    const post = await prisma.blogPost.update({ where: { id }, data });

    revalidatePage("/blog");
    revalidateBlogPost(post.slug);
    if (existing.slug !== post.slug) {
      revalidateBlogPost(existing.slug);
    }

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("content.delete");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await prisma.blogPost.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidatePage("/blog");
  revalidateBlogPost(existing.slug);

  return NextResponse.json({ ok: true });
}
