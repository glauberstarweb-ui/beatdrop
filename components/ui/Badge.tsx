import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-brand-500/20 text-brand-300 border border-brand-500/30",
        secondary: "bg-white/10 text-white/70 border border-white/10",
        success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        danger: "bg-red-500/20 text-red-300 border border-red-500/30",
        warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
