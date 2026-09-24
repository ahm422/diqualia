import type { Metadata } from "next";

import { Container } from "@/app/components/Container";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms information for the DiQualia marketing site.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <Container size="narrow" className="diq-pageTop pb-20">
      <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
        Terms
      </h1>
      <p className="mt-6 text-sm leading-8" style={{ color: "var(--text-muted)" }}>
        This is a placeholder terms page for the DiQualia marketing site. For contractual enquiries, email{" "}
        <a href="mailto:intel@diqualia.com" style={{ color: "var(--gold)" }}>
          intel@diqualia.com
        </a>
        .
      </p>
    </Container>
  );
}

