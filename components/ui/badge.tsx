import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest",
  {
    variants: {
      variant: {
        default: "border-[var(--diq_border)] text-[var(--diq_mid)]",
        gold: "border-[var(--gold)] text-[var(--gold)]",
        unread: "border-[var(--gold)] text-[var(--gold)]",
        new: "border-[var(--gold)] bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] text-[var(--gold)]",
        lead: "border-[var(--diq_border)] text-[var(--foreground)]",
        application: "border-[var(--diq_border)] text-[var(--foreground)]",
        published: "border-[var(--diq_border)] text-[var(--foreground)]",
        draft: "border-[var(--diq_border)] text-[var(--diq_mid)]",
        read: "border-[var(--diq_border)] text-[var(--diq_mid)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
