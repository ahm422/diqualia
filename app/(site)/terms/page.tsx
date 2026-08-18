import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — DiQualia",
};

export default function TermsPage() {
  return (
    <div className="diq-pageTop mx-auto w-full max-w-3xl px-6 pb-20">
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
    </div>
  );
}

