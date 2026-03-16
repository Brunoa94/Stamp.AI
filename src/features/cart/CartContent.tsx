"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCartSummary,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@/queries/cartQueries";
import {
  CartList,
  EmptyCart,
  CartSummary,
  PromoCodeInput,
} from "@/features/cart/components";
import { CartHeader } from "@/features/cart/sections/CartHeader";
import { CartPageLayout } from "@/features/cart/sections/CartPageLayout";
import { CartLoadingSkeleton } from "@/features/cart/sections/CartLoadingSkeleton";
import { CartMobileCta } from "@/features/cart/mobile/CartMobileCta";
import { cartTheme } from "@/theme/components";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function CartContent() {
  const router = useRouter();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
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
      <CartPageLayout>
        <CartHeader itemCount={0} />
        <CartLoadingSkeleton />
      </CartPageLayout>
    );
  }

  // Empty cart
  if (!cart || cart.cart_items.length === 0) {
    return (
      <CartPageLayout>
        <CartHeader itemCount={0} />
        <EmptyCart />
      </CartPageLayout>
    );
  }

  // Cart with items
  return (
    <CartPageLayout>
      <CartHeader itemCount={itemCount} />

      {/* Mobile: Single column layout */}
      <div className="lg:hidden">
        <CartList
          items={cart.cart_items}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemove}
          isUpdating={updateCartItem.isPending || removeCartItem.isPending}
        />

        <PromoCodeInput />

        <CartSummary
          itemCount={itemCount}
          subtotal={subtotal}
          onCheckout={handleCheckout}
        />

        <Link href="/stamp" className={cartTheme.continueLink}>
          ← Continue Browsing
        </Link>
      </div>

      {/* Desktop: 2-column grid layout */}
      <div className={cartTheme.page.grid}>
        {/* Left column: Cart items */}
        <div className={cartTheme.page.itemsColumn}>
          <CartList
            items={cart.cart_items}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
            isUpdating={updateCartItem.isPending || removeCartItem.isPending}
          />

          <Link href="/stamp" className={cartTheme.continueLink}>
            ← Continue Browsing
          </Link>
        </div>

        {/* Right column: Summary */}
        <aside className={cartTheme.page.summaryColumn}>
          <CartSummary
            itemCount={itemCount}
            subtotal={subtotal}
            onCheckout={handleCheckout}
          />
        </aside>
      </div>

      <CartMobileCta onCheckout={handleCheckout} />
    </CartPageLayout>
  );
}
