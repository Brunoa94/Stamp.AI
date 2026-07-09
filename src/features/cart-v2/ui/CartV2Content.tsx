/**
 * CartV2Content
 *
 * Container for the luxury brutalist cart. Handles data fetching and the
 * loading / empty / populated states, delegating presentation to the
 * colocated components. Reuses the existing cart query layer so no
 * business logic is duplicated.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useCartSummary,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@/queries/cartQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { CartServiceMapper } from "@/mappers/services/cartServiceMapper";
import { CartV2Layout } from "./components/CartV2Layout";
import { CartV2Header } from "./components/CartV2Header";
import { CartV2MobileCta } from "./components/CartV2MobileCta";
import { CartV2ItemCard } from "./sections/CartV2ItemCard/CartV2ItemCard";
import { CartV2OrderSummary } from "./sections/CartV2OrderSummary/CartV2OrderSummary";
import { CartV2EmptySection } from "./sections/CartV2EmptySection";
import { CartV2LoadingSection } from "./sections/CartV2LoadingSection";

export function CartV2Content() {
  const router = useRouter();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const { itemCount, cart, isLoading, error } = useCartSummary();
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
    router.push(`/checkout-v2?cartId=${cart.id}`);
  };

  if (isLoading) {
    return (
      <CartV2Layout>
        <CartV2LoadingSection />
      </CartV2Layout>
    );
  }

  if (!cart || cart.cart_items.length === 0) {
    return (
      <CartV2Layout>
        <CartV2EmptySection />
      </CartV2Layout>
    );
  }

  const { subtotal, shipping } = CartServiceMapper.calculateCartTotals(
    cart.cart_items,
  );
  const total = subtotal + shipping;

  return (
    <>
      <CartV2Layout>
        <CartV2Header itemCount={itemCount} />

        <div className="space-y-8 xl:col-span-8">
          {cart.cart_items.map((item) => (
            <CartV2ItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}

          <Link
            href="/stamp"
            className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-(--color-stamp-taupe) transition-colors hover:text-(--color-stamp-gold)"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Browsing
          </Link>
        </div>

        <div className="xl:col-span-4">
          <CartV2OrderSummary cart={cart} onCheckout={handleCheckout} />
        </div>
      </CartV2Layout>

      <CartV2MobileCta total={total} onCheckout={handleCheckout} />
    </>
  );
}
