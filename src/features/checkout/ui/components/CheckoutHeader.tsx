/**
 * CheckoutHeader
 *
 * Checkout page header matching the luxury brutalist system:
 * gold accent bar, Anton title with a gold-accented word, taupe subtitle.
 */

import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

export function CheckoutHeader() {
  return (
    <header className="space-y-4">
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
      <Heading as="h1" variant="title">
        Check<span className="text-(--color-stamp-gold)">out</span>
      </Heading>
      <Span variant="default" className="text-(--color-stamp-taupe)">
        Complete your order
      </Span>
    </header>
  );
}
