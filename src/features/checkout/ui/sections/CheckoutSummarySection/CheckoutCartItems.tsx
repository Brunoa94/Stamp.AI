import { ProductPrice } from "@/shared/ui/ProductPrice";
/**
 * CheckoutCartItems
 *
 * Compact scrollable cart-item list for the order summary, restyled to the
 * luxury brutalist system with a custom scrollbar.
 */

import { Paragraph } from "@/features/ui/paragraph";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { Span } from "@/features/ui/span";
import type { CartWithItems } from "@/shared/types/cart";

interface CheckoutCartItemsPropsI {
  items: CartWithItems["cart_items"];
}

export function CheckoutCartItems({ items }: CheckoutCartItemsPropsI) {
  const t = useTranslations("checkout.cartItems");
  return (
    <ul
      aria-label={t("listAria")}
      className="checkout-scrollbar max-h-80 space-y-3 overflow-y-auto"
    >
      {items.map((item) => {
        const name =
          item.product_name || item.product?.name || t("defaultProductName");
        const quantity = item.quantity ?? 1;
        const lineTotal = (item.unit_price ?? 0) * quantity;
        const variantName = item.variant?.name || t("standardVariant");
        return (
          <li
            key={item.id}
            className="flex gap-4 border border-(--color-stamp-divider) bg-(--color-stamp-cream)/20 p-3"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
              {item.custom_image_url ? (
                <Image
                  src={item.custom_image_url}
                  alt={t("imageAlt", { name, variant: variantName })}
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
              <Paragraph unstyled className="truncate text-lg font-bold uppercase tracking-[0.15em] text-(--color-stamp-chocolate)">
                {name}
              </Paragraph>
              <Span unstyled className="mt-1 block text-lg text-(--color-stamp-taupe)">
                {item.variant?.name || t("standard")}
              </Span>
              <div className="mt-2 flex items-center justify-between">
                <Span unstyled className="text-lg text-(--color-stamp-taupe)">
                  {t("qty", { quantity })}
                </Span>
                <Span unstyled className="text-2xl font-bold tabular-nums text-(--color-stamp-chocolate)">
                  <ProductPrice priceCents={lineTotal} regularPriceCents={item.regular_price_cents != null ? item.regular_price_cents * quantity : undefined} />
                </Span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
