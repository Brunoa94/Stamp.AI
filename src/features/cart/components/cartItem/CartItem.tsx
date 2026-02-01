"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { CartItemWithProduct } from "@/types/cart";
import { QuantitySelector } from "./QuantitySelector";
import { componentThemes } from "@/theme";
import clsx from "clsx";

interface Props {
  item: CartItemWithProduct;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartItem({ item, onUpdateQuantity, onRemove, isUpdating = false }: Props) {
  const itemTotal = item.unit_price * item.quantity;

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div
      className={clsx(
        "flex gap-4 p-4 bg-white rounded-lg border border-gray-200",
        "hover:border-purple-200 transition-colors",
        isUpdating && "opacity-50 pointer-events-none"
      )}
    >
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
        {item.custom_image_url ? (
          <Image
            src={item.custom_image_url}
            alt={item.product?.name || "Product"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className={componentThemes.text.subheading}>
          {item.product?.name || "Custom Design"}
        </h3>
        
        {item.variant && (
          <p className="text-sm text-gray-600 mt-1">Variant: {item.variant.name}</p>
        )}

        <p className="text-sm text-gray-500 mt-1">${item.unit_price.toFixed(2)} each</p>

        {/* Quantity Selector - Mobile */}
        <div className="mt-3 md:hidden">
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            disabled={isUpdating}
          />
        </div>
      </div>

      {/* Quantity Selector - Desktop */}
      <div className="hidden md:flex items-center">
        <QuantitySelector
          quantity={item.quantity}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          disabled={isUpdating}
        />
      </div>

      {/* Price & Remove */}
      <div className="flex flex-col items-end justify-between">
        <p className="font-bold text-lg text-gray-900">${itemTotal.toFixed(2)}</p>
        
        <button
          onClick={() => onRemove(item.id)}
          disabled={isUpdating}
          className={clsx(
            "p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors",
            isUpdating && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Remove item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
