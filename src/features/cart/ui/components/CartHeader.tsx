/**
 * CartHeader
 *
 * Cart page header in the luxury brutalist style:
 * - Thin gold accent bar
 * - Large Anton title with a gold-accented word
 * - Wide-tracked taupe subtitle reporting the item count
 */

import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

interface CartHeaderPropsI {
  itemCount: number;
}

export function CartHeader({ itemCount }: CartHeaderPropsI) {
  const itemText = itemCount === 1 ? "Item" : "Items";

  return (
    <header className="space-y-4 xl:col-span-12">
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />

      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-chocolate)"
      >
        Shopping{" "}
        <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
          bag
        </span>
      </Heading>
    </header>
  );
}
