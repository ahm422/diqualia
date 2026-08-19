import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

const sizeClass = {
  default: "max-w-none",
  narrow: "max-w-3xl",
  wide: "max-w-none",
} as const;

type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
  size?: keyof typeof sizeClass;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "size">;

export function Container<T extends ElementType = "div">({
  as,
  size = "default",
  className,
  children,
  ...rest
}: ContainerProps<T>) {
  const Comp = as ?? "div";
  return (
    <Comp
      className={cn("mx-auto w-full px-[var(--diq-gutter)]", sizeClass[size], className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}
