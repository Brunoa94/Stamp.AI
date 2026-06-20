import { Separator } from "@/features/ui/separator";
import { cn } from "@/lib/utils";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

interface PropsI {
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
}: PropsI) {
  return (
    <div className={cn("max-w-screen-2xl mx-auto mb-20", className)}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-4">
        <Heading as="h2" variant="section">
          {title}
        </Heading>
        <Span
          variant="sm"
          className={inverted ? "opacity-20" : "opacity-30"}
        >
          {label}
        </Span>
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
