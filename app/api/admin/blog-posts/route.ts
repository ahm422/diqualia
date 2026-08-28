import "server-only";

import { NextResponse } from "next/server";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { hasPermission } from "@/lib/auth/session";
import { getDb } from "@/lib/cloudflare-env";
import { blogPostCreateSchema } from "@/lib/schemas/admin/blog";
import { revalidateBlogPost, revalidatePage } from "@/lib/revalidate-site";

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.view");
  if (session instanceof NextResponse) return session;

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.edit");
  if (session instanceof NextResponse) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = blogPostCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const status = parsed.data.status ?? "draft";
  if (status === "published" && !hasPermission(session, "content.publish")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const existing = await prisma.blogPost.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return NextResponse.json({ error: "slug already exists" }, { status: 400 });
  }

  const post = await prisma.blogPost.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      body: parsed.data.body,
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      status,
      publishedAt: status === "published" ? new Date() : null,
    },
  });

  revalidatePage("/blog");
  if (status === "published") {
    revalidateBlogPost(post.slug);
  }

  return NextResponse.json(post, { status: 201 });
}
