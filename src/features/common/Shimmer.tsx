import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

interface ShimmerProps {
  className?: string;
  style?: CSSProperties;
}

export function Shimmer({ className, style }: ShimmerProps) {
  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-lg bg-slate-200",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-linear-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className,
      )}
    />
  );
}
