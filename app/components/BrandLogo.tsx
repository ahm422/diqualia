"use client";

import Image from "next/image";

type BrandLogoVariant = "black" | "white";

export function BrandLogo({
  variant,
  decorative,
  className,
  width = 140,
  src: customSrc,
}: {
  variant: BrandLogoVariant;
  decorative?: boolean;
  className?: string;
  width?: number;
  src?: string | null;
}) {
  const src =
    customSrc ??
    (variant === "white" ? "/Di Qualia White Logo-03.svg" : "/Di Qualia Black Logo-04.svg");

  return (
    <Image
      src={src}
      alt={decorative ? "" : "Diqualia"}
      aria-hidden={decorative ? true : undefined}
      width={width}
      height={Math.round((width * 156.5) / 500)}
      priority
      className={className}
      style={{ height: "auto", width }}
    />
  );
}

