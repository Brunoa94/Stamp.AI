import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
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
