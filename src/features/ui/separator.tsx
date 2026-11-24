import { cn } from "@/lib/utils";

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function Separator({ className, orientation = "horizontal" }: SeparatorProps) {
  return (
    <div
      className={cn(
        "bg-(--color-stamp-divider)",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
    />
  );
}
