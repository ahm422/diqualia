import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — DiQualia",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
        Privacy
      </h1>
      <p className="mt-6 text-sm leading-8" style={{ color: "var(--text-muted)" }}>
        This is a placeholder privacy page for the DiQualia marketing site. For privacy enquiries, email{" "}
        <a href="mailto:intel@diqualia.com" style={{ color: "var(--gold)" }}>
          intel@diqualia.com
        </a>
        .
      </p>
    </div>
  );
}

