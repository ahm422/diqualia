import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { checkRateLimit } from "@/lib/rateLimit";
import { uploadObject, publicUrl } from "@/lib/storage";

// Allowed MIME types → file extension
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  // 1. Auth — returns 401 JSON if invalid; never redirects
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  // 2. Rate limit — 20 uploads per minute per admin
  const rl = checkRateLimit({ key: `upload:${session.id}`, limit: 20, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  // 3. Parse multipart body
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // 4. Validate MIME type
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "File type not allowed. Accepted: JPEG, PNG, WebP, SVG." },
      { status: 400 },
    );
  }

  // 5. Validate size
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 413 });
  }

  // 6. Upload to Garage — key: uploads/<uuid>.<ext>
  const key = `uploads/${crypto.randomUUID()}.${ext}`;
  const body = Buffer.from(await file.arrayBuffer());

  try {
    await uploadObject({ key, body, contentType: file.type });
  } catch (err) {
    console.error("[upload] S3 error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl(key), key });
}
