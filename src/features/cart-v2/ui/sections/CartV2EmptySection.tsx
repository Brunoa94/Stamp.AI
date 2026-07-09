/**
 * CartV2EmptySection
 *
 * Empty cart state in the luxury brutalist style:
 * - Cream icon plate with a subtle tilt
 * - Playfair serif italic headline
 * - Chocolate → gold CTA back to the stamp creator
 */

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

export function CartV2EmptySection() {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-32 text-center xl:col-span-12"
    >
      <div className="mb-8 flex h-40 w-40 rotate-3 items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
        <ShoppingBag
          className="h-16 w-16 text-(--color-stamp-taupe)/30"
          aria-hidden="true"
        />
      </div>

      <h1 className="mb-4 font-(--font-playfair) text-4xl italic text-(--color-stamp-chocolate)">
        Your Bag is Empty
      </h1>

      <Span variant="default" className="mb-10 text-(--color-stamp-taupe)">
        No items in production protocol
      </Span>

      <Button asChild variant="secondary-brown" className="group">
        <Link href="/stamp">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Start Creating
        </Link>
      </Button>
    </div>
  );
}
