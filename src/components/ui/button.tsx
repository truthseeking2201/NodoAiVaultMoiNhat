import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-brand text-white shadow-brand hover:shadow-brand-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-white/10 bg-transparent hover:bg-white/5 hover:border-white/20 font-semibold",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "border border-brand-500 text-brand-500 hover:bg-brand-50/10",
        link: "text-brand-500 underline-offset-4 hover:underline",
        nova: "bg-gradient-to-r from-nova-light to-nova text-white shadow-neon-nova hover:shadow-brand-hover",
        orion:
          "bg-gradient-to-r from-orion-light to-orion text-white shadow-neon-orion hover:opacity-90",
        emerald:
          "bg-gradient-to-r from-emerald-light to-emerald text-white shadow-neon-emerald hover:opacity-90",
        "neural-orange":
          "bg-gradient-to-r from-[#FF8A00] to-[#FF6B00] text-white shadow-[0_4px_12px_-2px_rgba(255,138,0,0.3)] hover:shadow-[0_4px_16px_-2px_rgba(255,138,0,0.4)] hover:scale-[0.98] transition-all active:scale-95",
        primary: "bg-ai text-[#0A080E] font-semibold hover:bg-ai/90",
        "pagination-default": "bg-black text-white/70 font-semibold hover:bg-black/70",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-[16px]",
        xl: "h-14 rounded-xl px-16 text-lg",
        icon: "h-10 w-10 rounded-lg",
        pagination: "h-[32px] w-[32px] rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
