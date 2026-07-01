import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallback?: string;
}

const sizes = { sm: 32, md: 40, lg: 48, xl: 64 };
const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base", xl: "text-lg" };

export function Avatar({ src, alt = "Avatar", size = "md", className, fallback }: AvatarProps) {
  const px = sizes[size];
  const letter = fallback?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center bg-gradient-brand shrink-0",
        className
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes={`${px}px`} />
      ) : (
        <span className={cn("font-bold text-white", textSizes[size])}>{letter}</span>
      )}
    </div>
  );
}
