import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-sans text-[clamp(11px,1.1vw,12px)] font-medium uppercase tracking-[clamp(2px,0.5vw,3px)] transition-[background-color,color,border-color,transform] duration-300 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color-mix(in_oklab,var(--gold)_70%,white)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-gold bg-gold text-ink hover:bg-gold-lt",
        primary:
          "border border-gold bg-gold text-ink hover:bg-gold-lt",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-gold bg-transparent text-gold hover:bg-gold hover:text-ink",
        secondary:
          "border border-gold bg-transparent text-gold hover:bg-gold hover:text-ink",
        ghost:
          "border border-transparent bg-transparent text-inherit hover:text-gold",
        link:
          "border border-transparent bg-transparent text-inherit hover:text-gold",
      },
      size: {
        default: "min-h-11 px-[clamp(1.375rem,6vw,2.75rem)] py-3.5 leading-none",
        sm: "min-h-9 px-5 py-2.5 leading-none",
        lg: "min-h-12 px-10 py-4 leading-none",
        icon: "size-9 shrink-0 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
