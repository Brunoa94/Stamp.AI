"use client";

import { CartItem as CartItemT } from "@/types/cart";
import { CartItemImage } from "./CartItemImage";
import { CartItemDetails } from "./CartItemDetails";
import { CartItemDesktopControls } from "./CartItemDesktopControls";
import { CartItemExpandableDetails } from "./CartItemExpandableDetails";
import { cartTheme } from "@/theme/components";
import clsx from "clsx";

interface Props {
  item: CartItemT;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: Props) {
  const itemTotal = item.unit_price * item.quantity;

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <div
      className={clsx(
        cartTheme.item.card,
        isUpdating && cartTheme.item.cardRemoving,
      )}
    >
      <div className={cartTheme.item.body}>
        <CartItemImage
          imageUrl={item.custom_image_url}
          productName={item.product?.name}
        />
        <CartItemDetails
          item={item}
          itemTotal={itemTotal}
          onRemove={handleRemove}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          isUpdating={isUpdating}
        />
      </div>

      <CartItemDesktopControls
        itemTotal={itemTotal}
        quantity={item.quantity}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemove}
        isUpdating={isUpdating}
      />

      <CartItemExpandableDetails
        unitPrice={item.unit_price}
        variantName={item.variant?.name}
        productName={item.product?.name}
      />
    </div>
  );
}
