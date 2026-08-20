import { redirectAdminSection } from "@/lib/admin/section-redirect";

const PROCESS_SECTIONS = {
  hero: "/admin/process/hero",
  steps: "/admin/process/steps",
  "where-next": "/admin/process/where-next",
} as const;

export default async function ProcessAdminRedirect({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  redirectAdminSection(PROCESS_SECTIONS, section, "hero");
}
