import { Check } from "lucide-react";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface PropsI {
  className?: string;
}

/** Amber check disc marking the selected option card. */
export function CreditSelectedCheck({ className }: PropsI) {
  return (
    <Span
      unstyled
      aria-hidden="true"
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded-full bg-(--color-stamp-gold) text-(--color-stamp-chocolate)",
        className,
      )}
    >
      <Check className="h-3 w-3" />
    </Span>
  );
}
