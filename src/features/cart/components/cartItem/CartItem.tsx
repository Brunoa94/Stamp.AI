"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { CartItem as CartItemT } from "@/types/cart";
import { QuantitySelector } from "./QuantitySelector";
import { componentThemes } from "@/theme";
import clsx from "clsx";

interface Props {
  item: CartItemT;
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

  const isCustomProduct = !!item.custom_image_url;

  return (
    <div
      className={clsx(
        "flex gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm",
        "hover:border-purple-300 hover:shadow-md transition-all duration-200",
        isUpdating && "opacity-50 pointer-events-none"
      )}
    >
      {/* Product Image */}
      <div className="relative w-28 h-28 shrink-0 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg overflow-hidden border border-purple-100">
        {item.custom_image_url ? (
          <>
            <Image
              src={item.custom_image_url}
              alt={item.product?.name || "Product"}
              fill
              className="object-cover"
            />
            {isCustomProduct && (
              <div className="absolute top-1 right-1">
                <span className="px-2 py-1 bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-md shadow-lg">
                  Custom
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className={clsx(componentThemes.text.subheading, "text-gray-900 font-semibold")}>
          {item.product_name || item.product?.name || "Custom Design"}
        </h3>

        {item.variant && (
          <p className="text-sm text-gray-600 mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Variant: {item.variant.name}
          </p>
        )}

        <p className="text-sm font-medium text-purple-600 mt-2">${item.unit_price.toFixed(2)} each</p>

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
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="font-bold text-xl text-gray-900">${itemTotal.toFixed(2)}</p>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          disabled={isUpdating}
          className={clsx(
            "p-2.5 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-600",
            isUpdating && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
