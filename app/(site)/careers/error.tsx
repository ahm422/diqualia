"use client";

import { useEffect } from "react";

import { Container } from "@/app/components/Container";
import { Button } from "@/components/ui/button";

export default function CareersError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[careers] render error:", error);
  }, [error]);

  return (
    <main className="diq-pageTop pb-20">
      <Container size="narrow" className="text-center">
        <div className="text-[11px] tracking-[0.35em] uppercase text-primary">Careers</div>
        <h1
          className="mt-6 text-foreground"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            lineHeight: 1.15,
          }}
        >
          This page could not load
        </h1>
        <p className="mt-4 text-[15px] leading-8 text-muted-foreground">
          Something went wrong while loading careers. Try again, or come back shortly.
        </p>
        <div className="mt-8">
          <Button type="button" variant="primary" onClick={() => unstable_retry()}>
            Try again
          </Button>
        </div>
      </Container>
    </main>
  );
}
