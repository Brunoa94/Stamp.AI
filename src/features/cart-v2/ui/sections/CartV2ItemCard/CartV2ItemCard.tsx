/**
 * CartV2ItemCard
 *
 * Single cart line item in the luxury brutalist style: white card with a
 * subtle chocolate divider border that lifts and gains a gold border on
 * hover. Composes the image, content and action sub-parts.
 */

"use client";

import { CartV2ItemCardImage } from "./CartV2ItemCardImage";
import { CartV2ItemCardContent } from "./CartV2ItemCardContent";
import { CartV2ItemCardActions } from "./CartV2ItemCardActions";
import type { CartItem } from "@/types/cart";

interface CartV2ItemCardPropsI {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartV2ItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartV2ItemCardPropsI) {
  const productName =
    item.product_name || item.product?.name || "Custom Product";

  return (
    <article className="cart-v2-item border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stamp-gold) hover:shadow-(--shadow-stamp-card-hover) lg:p-10">
      <div className="flex flex-col items-start gap-8 md:flex-row md:gap-10">
        <CartV2ItemCardImage
          imageUrl={item.custom_image_url}
          productName={productName}
        />

        <div className="flex w-full flex-1 flex-col justify-between self-stretch">
          <CartV2ItemCardContent item={item} />
          <CartV2ItemCardActions
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        </div>
      </div>
    </article>
  );
}
