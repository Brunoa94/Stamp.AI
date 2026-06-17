"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useCartSummary,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@/queries/cartQueries";
import { CartBackground } from "./components/CartBackground";
import { CartLayout } from "./components/CartLayout";
import { CartHeader } from "./components/CartHeader";
import { CartItemCard } from "./components/CartItemCard";
import { OrderSummary } from "./components/OrderSummary";
import { EmptyCart } from "./components/EmptyCart";
import { CartLoadingSkeleton } from "./components/CartLoadingSkeleton";
import { CartMobileCta } from "./components/CartMobileCta";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function CartContent() {
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
    router.push(`/checkout?cartId=${cart.id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <CartBackground />
        <CartLayout>
          <div className="lg:col-span-12">
            <CartLoadingSkeleton />
          </div>
        </CartLayout>
      </>
    );
  }

  // Empty cart
  if (!cart || cart.cart_items.length === 0) {
    return (
      <>
        <CartBackground />
        <CartLayout>
          <EmptyCart />
        </CartLayout>
      </>
    );
  }

  // Cart with items
  return (
    <>
      <CartBackground />
      <CartLayout>
        <CartHeader itemCount={itemCount} />

        {/* Left column: Cart items */}
        <div className="xl:col-span-8 space-y-12">
          {cart.cart_items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}

          <Link
            href="/stamp"
            className="inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 hover:opacity-100 hover:text-brandPurple transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Browsing Terminal
          </Link>
        </div>

        {/* Right column: Order summary */}
        <div className="xl:col-span-4">
          <OrderSummary cart={cart} onCheckout={handleCheckout} />
        </div>
      </CartLayout>

      <CartMobileCta onCheckout={handleCheckout} />
    </>
  );
}
