"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useCart, useCartMutations, useCartSummary } from "@/hooks/useCart";
import { CartHeader } from "@/features/cart/sections";
import { CartList, EmptyCart, CartSummary } from "@/features/cart/components";
import { componentThemes } from "@/theme";
import clsx from "clsx";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useUser } from "@/hooks/useAuth";

function CartContent() {
  const router = useRouter();
  const { data: user } = useUser();
  const { updateCartItem, removeCartItem } = useCartMutations();
  const { subtotal, itemCount, cart, isLoading, error } = useCartSummary();
  const { handleError } = useErrorHandler();

  if (error) handleError(error);

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateCartItem.mutate({ itemId, update: { quantity } });
  };

  const handleRemove = (itemId: string) => {
    removeCartItem.mutate(itemId);
  };

  const handleCheckout = () => {
    if (!cart) return;
    router.push(`/checkout?cartId=${cart.id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={clsx(componentThemes.container.page, "py-8")}>
        <div className="max-w-6xl mx-auto px-4">
          <CartHeader />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.cart_items.length === 0) {
    return (
      <div className={clsx(componentThemes.container.page, "py-8")}>
        <div className="max-w-6xl mx-auto px-4">
          <CartHeader />
          <EmptyCart />
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div className={clsx(componentThemes.container.page, "py-8")}>
      <div className="max-w-6xl mx-auto px-4">
        <CartHeader />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Column (2/3) */}
          <div className="lg:col-span-2">
            <CartList
              items={cart.cart_items}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
              isUpdating={updateCartItem.isPending || removeCartItem.isPending}
            />
          </div>

          {/* Cart Summary - Right Column (1/3) */}
          <div className="lg:col-span-1">
            <CartSummary
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isProcessing={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
