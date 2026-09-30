import type { Metadata } from "next";

import { Container } from "@/app/components/Container";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the DiQualia marketing site, including how job-application data is retained and deleted.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <Container size="narrow" className="diq-pageTop pb-20">
      <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
        Privacy
      </h1>
      <p className="mt-6 text-sm leading-8" style={{ color: "var(--text-muted)" }}>
        This is a placeholder privacy page for the DiQualia marketing site. Job applications may include a CNIC and photograph; rejected applications are retained for 12 months, then deleted. For privacy enquiries, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--gold)" }}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </Container>
  );
}

