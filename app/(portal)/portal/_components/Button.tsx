"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

// Portal-local button: a calmer, "client portal" look than the marketing
// components/ui/button.tsx (rounded-md, sentence case) plus a `loading` state.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-[var(--gold)] text-[var(--ink)] hover:opacity-90",
        outline:
          "border border-[var(--diq_border)] text-[var(--foreground)] hover:border-[var(--gold)]",
        ghost: "text-[var(--foreground)] hover:bg-[var(--diq_panel)]",
        danger:
          "border border-[color-mix(in_oklab,var(--status-negative)_45%,transparent)] text-[var(--status-negative)] hover:bg-[var(--status-negative-tint)]",
      },
      size: {
        sm: "min-h-9 px-3 text-xs",
        md: "min-h-11 px-4 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    // Slot requires exactly one child — no spinner injection in asChild mode.
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden />
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "PortalButton";
