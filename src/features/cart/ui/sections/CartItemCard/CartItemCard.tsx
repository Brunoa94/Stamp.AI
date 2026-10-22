/**
 * CartItemCard
 *
 * Single cart line item in the luxury brutalist style: white card with a
 * subtle chocolate divider border that lifts and gains a gold border on
 * hover. Composes the image, content and action sub-parts.
 */

"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/features/ui/checkbox";
import { CartItemCardImage } from "./CartItemCardImage";
import { CartItemCardContent } from "./CartItemCardContent";
import { CartItemCardActions } from "./CartItemCardActions";
import type { CartItem } from "@/shared/types/cart";

interface CartItemCardPropsI {
  item: CartItem;
  isSelected: boolean;
  onToggleSelection: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemCard({
  item,
  isSelected,
  onToggleSelection,
  onUpdateQuantity,
  onRemove,
}: CartItemCardPropsI) {
  const t = useTranslations("cart.itemCard");
  const productName =
    item.product_name || item.product?.name || t("customProduct");

  return (
    <article
      className={`cart-item border bg-(--color-stamp-white) p-4 font-heading transition-all duration-500 hover:-translate-y-1 hover:shadow-(--shadow-stamp-card-hover) md:p-8 lg:p-10 ${
        isSelected
          ? "border-(--color-stamp-gold)"
          : "border-(--color-stamp-divider) hover:border-(--color-stamp-gold)"
      }`}
    >
      <div className="flex flex-col items-start gap-4 md:flex-row md:gap-10">
        {/* Selection checkbox */}
        <div className="flex items-center self-center md:self-start md:pt-2">
          <Checkbox
            variant="stamp"
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(item.id)}
            aria-label={t("selectItem", { product: productName })}
          />
        </div>

        <CartItemCardImage
          imageUrl={item.custom_image_url}
          productName={productName}
        />

        <div className="flex w-full flex-1 flex-col justify-between self-stretch">
          <CartItemCardContent item={item} />
          <CartItemCardActions
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        </div>
      </div>
    </article>
  );
}
