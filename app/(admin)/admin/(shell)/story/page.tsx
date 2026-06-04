import { requireAdmin } from "@/lib/auth/require-admin";

export default async function StoryPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="font-sans text-2xl font-medium mb-4">Story</h1>
      <p className="text-[var(--diq_mid)] text-sm">Content editing coming soon.</p>
    </div>
  );
}
