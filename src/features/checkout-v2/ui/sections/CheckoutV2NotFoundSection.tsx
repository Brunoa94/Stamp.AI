/**
 * CheckoutV2NotFoundSection
 *
 * Error state shown when the checkout cart cannot be resolved. Provides a
 * clear message and a recovery path back to the cart.
 */

import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

export function CheckoutV2NotFoundSection() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-stamp-off-white) px-6 font-(--font-outfit) text-(--color-stamp-chocolate)">
      <div
        role="alert"
        className="max-w-md border border-(--color-stamp-divider) bg-(--color-stamp-white) p-12 text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
          <PackageX
            className="h-10 w-10 text-(--color-stamp-taupe)"
            aria-hidden="true"
          />
        </div>
        <Heading
          as="h1"
          unstyled
          className="mb-4 font-(--font-playfair) text-3xl italic"
        >
          Cart Not Found
        </Heading>
        <Paragraph variant="sm" className="mb-8 text-(--color-stamp-taupe)">
          We couldn&apos;t find your cart. Please return and add items again.
        </Paragraph>
        <Button asChild variant="secondary-brown">
          <Link href="/cart">Back to Cart</Link>
        </Button>
      </div>
    </div>
  );
}
