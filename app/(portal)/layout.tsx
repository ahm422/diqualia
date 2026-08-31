import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applicant portal — DiQualia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">{children}</div>;
}
