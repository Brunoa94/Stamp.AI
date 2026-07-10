/**
 * HomeTrustIndicators
 *
 * Row of gold-dot + uppercase label trust items used under hero/CTA copy.
 */

import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface HomeTrustIndicatorsPropsI {
  items: string[];
  className?: string;
}

export function HomeTrustIndicators({
  items,
  className,
}: HomeTrustIndicatorsPropsI) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-10 gap-y-4", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3">
          <Span
            unstyled
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-(--color-stamp-gold)"
          />
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {item}
          </Span>
        </li>
      ))}
    </ul>
  );
}
