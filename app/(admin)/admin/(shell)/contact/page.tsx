import { redirectAdminSection } from "@/lib/admin/section-redirect";

const CONTACT_SECTIONS = {
  hero: "/admin/contact/hero",
  "email-card": "/admin/contact/email-card",
  "what-to-include": "/admin/contact/what-to-include",
  expectation: "/admin/contact/expectation",
} as const;

export default async function ContactAdminRedirect({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  redirectAdminSection(CONTACT_SECTIONS, section, "hero");
}
