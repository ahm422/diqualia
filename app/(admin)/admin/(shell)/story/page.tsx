import { redirectAdminSection } from "@/lib/admin/section-redirect";

const STORY_SECTIONS = {
  hero: "/admin/story/hero",
  dx: "/admin/story/dx",
  manifesto: "/admin/story/manifesto",
} as const;

export default async function StoryAdminRedirect({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  redirectAdminSection(STORY_SECTIONS, section, "hero");
}
