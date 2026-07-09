/**
 * CheckoutV2SectionCard
 *
 * Consistent wrapper for checkout sections in the luxury brutalist style:
 * white surface, subtle chocolate divider border, no radius. Renders a
 * gold eyebrow label + taupe subtitle header when a title is provided.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

interface CheckoutV2SectionCardPropsI {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function CheckoutV2SectionCard({
  title,
  subtitle,
  children,
  className,
}: CheckoutV2SectionCardPropsI) {
  return (
    <section
      className={cn(
        "border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 lg:p-10",
        className,
      )}
    >
      {title && (
        <header className="mb-8 space-y-2 border-b border-(--color-stamp-divider) pb-4">
          <Heading as="h2" variant="card">
            {title}
          </Heading>
          {subtitle && (
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              {subtitle}
            </Span>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
