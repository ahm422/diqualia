"use client";

import Image from "next/image";

type BrandLogoVariant = "black" | "white";

export function BrandLogo({
  variant,
  decorative,
  className,
  width = 140,
  src: customSrc,
  priority = false,
}: {
  variant: BrandLogoVariant;
  decorative?: boolean;
  className?: string;
  width?: number;
  src?: string | null;
  /** Set only for an above-the-fold instance (e.g. the header). Off by default. */
  priority?: boolean;
}) {
  const src =
    customSrc ??
    (variant === "white" ? "/Di Qualia White Logo-03.svg" : "/Di Qualia Black Logo-04.svg");

  return (
    <Image
      src={src}
      alt={decorative ? "" : "DiQualia"}
      aria-hidden={decorative ? true : undefined}
      width={width}
      height={Math.round((width * 156.5) / 500)}
      priority={priority}
      className={className}
      style={{ height: "auto", width }}
    />
  );
}

