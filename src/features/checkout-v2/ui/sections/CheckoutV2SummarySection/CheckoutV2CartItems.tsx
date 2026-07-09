/**
 * CheckoutV2CartItems
 *
 * Compact scrollable cart-item list for the order summary, restyled to the
 * luxury brutalist system with a custom scrollbar.
 */

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Span } from "@/features/ui/span";
import type { CartWithItems } from "@/types/cart";

interface CheckoutV2CartItemsPropsI {
  items: CartWithItems["cart_items"];
}

export function CheckoutV2CartItems({ items }: CheckoutV2CartItemsPropsI) {
  return (
    <ul
      aria-label="Order items"
      className="checkout-v2-scrollbar max-h-80 space-y-3 overflow-y-auto"
    >
      {items.map((item) => {
        const name = item.product_name || item.product?.name || "Custom Product";
        const lineTotal = (item.unit_price ?? 0) * item.quantity;
        return (
          <li
            key={item.id}
            className="flex gap-4 border border-(--color-stamp-divider) bg-(--color-stamp-cream)/20 p-3"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
              {item.custom_image_url ? (
                <Image
                  src={item.custom_image_url}
                  alt={`${name} — ${item.variant?.name || "Standard variant"}`}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ShoppingBag
                  className="h-5 w-5 text-(--color-stamp-taupe)/40"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold uppercase tracking-[0.15em] text-(--color-stamp-chocolate)">
                {name}
              </p>
              <Span variant="micro" className="mt-1 block text-(--color-stamp-taupe)">
                {item.variant?.name || "Standard"}
              </Span>
              <div className="mt-2 flex items-center justify-between">
                <Span variant="micro" className="text-(--color-stamp-taupe)">
                  Qty {item.quantity}
                </Span>
                <span className="text-xs font-bold tabular-nums text-(--color-stamp-chocolate)">
                  ${(lineTotal / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
