/**
 * CheckoutSectionCard
 *
 * Wrapper for each checkout form section, in the shared card style (the
 * same as the cart's item cards and summary): white rounded-xl card with a
 * divider border and soft shadow, and a slab-serif title when one is given.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "@/features/ui/heading";

interface CheckoutSectionCardPropsI {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function CheckoutSectionCard({
  title,
  children,
  className,
}: CheckoutSectionCardPropsI) {
  return (
    <section
      className={cn(
        "rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 shadow-(--shadow-stamp-card) lg:p-8",
        className,
      )}
    >
      {title && (
        <header className="mb-6 border-b border-(--color-stamp-divider) pb-4">
          <Heading
            as="h2"
            variant="sectionSlab"
            className="text-(--color-stamp-chocolate)"
          >
            {title}
          </Heading>
        </header>
      )}
      {children}
    </section>
  );
}
