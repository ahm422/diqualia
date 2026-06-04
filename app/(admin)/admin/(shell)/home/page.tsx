import { requireAdmin } from "@/lib/auth/require-admin";

export default async function HomePage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="font-sans text-2xl font-medium mb-4">Home</h1>
      <p className="text-[var(--diq_mid)] text-sm">Content editing coming soon.</p>
    </div>
  );
}
