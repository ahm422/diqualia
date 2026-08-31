import Link from "next/link";

type CareerRoleCardProps = {
  slug: string;
  title: string;
  department: string;
  type: string;
  location: string;
  /** Heading tag for the role title — `h3` on the listing, `h2` in the related-roles strip. */
  headingLevel?: "h2" | "h3";
};

export function CareerRoleCard({
  slug,
  title,
  department,
  type,
  location,
  headingLevel = "h3",
}: CareerRoleCardProps) {
  const Heading = headingLevel;

  return (
    <Link href={`/careers/${slug}`} className="diq-career-roleCard group no-underline">
      <div className="text-[10px] tracking-[0.22em] uppercase text-primary">
        {[department, type].filter(Boolean).join(" · ")}
      </div>
      <Heading
        className="mt-4 text-foreground transition-colors group-hover:text-primary"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(1.35rem, 2.4vw, 1.75rem)",
          lineHeight: 1.2,
        }}
      >
        {title}
      </Heading>
      {location ? (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-muted-foreground">
          <span aria-hidden className="text-primary">
            ◆
          </span>
          {location}
        </p>
      ) : null}
      <div className="mt-6 text-[11px] tracking-[0.22em] uppercase text-primary">
        View role <span aria-hidden className="diq-career-roleArrow">→</span>
      </div>
    </Link>
  );
}
