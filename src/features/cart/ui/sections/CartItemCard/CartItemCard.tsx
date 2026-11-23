/**
 * CartItemCard
 *
 * Single cart line item in the shared card style: a white rounded-xl card
 * with a divider border and soft shadow; an amber border marks a selected
 * item. Composes the image, content and action sub-parts.
 */

"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/features/ui/checkbox";
import { CartItemCardImage } from "./CartItemCardImage";
import { CartItemCardContent } from "./CartItemCardContent";
import { CartItemCardActions } from "./CartItemCardActions";
import type { CartItem } from "@/shared/types/cart";
import { useCartItemDisplayName } from "@/shared/hooks/useCartItemDisplayName";

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
  const productName = useCartItemDisplayName()(item, t("customProduct"));

  return (
    <article
      className={`cart-item rounded-xl border bg-(--color-stamp-white) p-4 shadow-(--shadow-stamp-card) transition-colors duration-200 md:p-6 ${
        isSelected
          ? "border-(--color-stamp-gold)"
          : "border-(--color-stamp-divider) hover:border-(--color-stamp-chocolate)/30"
      }`}
    >
      <div className="flex flex-col items-start gap-4 md:flex-row md:gap-6">
        {/* Selection checkbox */}
        <div className="flex items-center self-start md:pt-2">
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
