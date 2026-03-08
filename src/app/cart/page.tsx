"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import {
  useCartSummary,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@/queries/cartQueries";
import { PageHeader } from "@/features/ui/page-header";
import { CartList, EmptyCart, CartSummary } from "@/features/cart/components";
import { cartTheme } from "@/theme/components";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Button } from "@/features/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function CartContent() {
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
      <div className={cartTheme.page.container}>
        <div
          className={
            cartTheme.page.sideDivider + " " + cartTheme.page.sideDividerLeft
          }
        />
        <div
          className={
            cartTheme.page.sideDivider + " " + cartTheme.page.sideDividerRight
          }
        />
        <main className={cartTheme.page.main}>
          <PageHeader
            title="Shopping Cart"
            description={`${itemCount} ${itemCount === 1 ? "item" : "items"} ready for production`}
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </main>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.cart_items.length === 0) {
    return (
      <div className={cartTheme.page.container}>
        <div
          className={
            cartTheme.page.sideDivider + " " + cartTheme.page.sideDividerLeft
          }
        />
        <div
          className={
            cartTheme.page.sideDivider + " " + cartTheme.page.sideDividerRight
          }
        />
        <main className={cartTheme.page.main}>
          <PageHeader
            title="Shopping Cart"
            description="Your cart is empty"
          />
          <EmptyCart />
        </main>
      </div>
    );
  }

  // Cart with items
  return (
    <div className={cartTheme.page.container}>
      <div
        className={
          cartTheme.page.sideDivider + " " + cartTheme.page.sideDividerLeft
        }
      />
      <div
        className={
          cartTheme.page.sideDivider + " " + cartTheme.page.sideDividerRight
        }
      />
      <main className={cartTheme.page.main}>
        <PageHeader
          title="Shopping Cart"
          description={`${itemCount} ${itemCount === 1 ? "item" : "items"} ready for production`}
        />

        <div className={cartTheme.actions.row}>
          <Button
            asChild
            variant="outline"
            className={cartTheme.actions.continueLink}
          >
            <Link href="/stamp">
              <ArrowLeft className="w-4 h-4" />
              Keep Designing
            </Link>
          </Button>
        </div>

        <div className={cartTheme.page.grid}>
          <div className={cartTheme.page.itemsColumn}>
            <CartList
              items={cart.cart_items}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
              isUpdating={updateCartItem.isPending || removeCartItem.isPending}
            />
          </div>

          <div className={cartTheme.page.summaryColumn}>
            <CartSummary
              itemCount={itemCount}
              subtotal={subtotal}
              onCheckout={handleCheckout}
              isProcessing={false}
            />
          </div>
        </div>
      </main>
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
