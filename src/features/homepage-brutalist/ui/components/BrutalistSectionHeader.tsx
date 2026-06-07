import { Separator } from "@/features/ui/separator";
import { cn } from "@/lib/utils";

interface BrutalistSectionHeaderProps {
  title: string;
  label: string;
  inverted?: boolean;
  className?: string;
}

export function BrutalistSectionHeader({
  title,
  label,
  inverted = false,
  className,
}: BrutalistSectionHeaderProps) {
  return (
    <div className={cn("max-w-screen-2xl mx-auto mb-20", className)}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-4">
        <h2 className="font-anton text-6xl md:text-7xl lg:text-9xl uppercase tracking-tighter leading-none">
          {title}
        </h2>
        <span
          className={cn(
            "text-[11px] font-bold tracking-[0.4em] uppercase font-space",
            inverted ? "opacity-20" : "opacity-30",
          )}
        >
          {label}
        </span>
      </div>
      <Separator
        className={cn(
          "w-full",
          inverted
            ? "bg-linear-to-r from-white via-white/20 to-transparent"
            : "bg-linear-to-r from-ink via-ink/20 to-transparent",
        )}
      />
    </div>
  );
}
