/**
 * CheckoutHeader
 *
 * Checkout page header matching the luxury brutalist system:
 * gold accent bar, Anton title with a gold-accented word, taupe subtitle.
 */

import { Heading } from "@/features/ui/heading";

export function CheckoutHeader() {
  return (
    <header className="space-y-4">
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-chocolate)"
      >
        Check{" "}
        <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
          out
        </span>
      </Heading>
    </header>
  );
}
