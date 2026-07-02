import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-white hover:bg-brand-400 shadow-md shadow-brand-500/25 active:scale-[0.96]",
        secondary:
          "bg-surface-600 text-white hover:bg-surface-500 border border-white/10",
        outline:
          "border border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm",
        ghost: "text-white/70 hover:text-white hover:bg-white/10",
        danger:
          "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
        success:
          "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30",
        music:
          "border border-brand-500/40 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 hover:border-brand-500/60 hover:text-brand-200",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button, buttonVariants };
