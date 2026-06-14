"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useCartSummary,
  useUpdateCartItem,
  useRemoveCartItem,
} from "@/queries/cartQueries";
import { BrutalistCartBackground } from "./brutalist/BrutalistCartBackground";
import { BrutalistCartLayout } from "./brutalist/BrutalistCartLayout";
import { BrutalistCartHeader } from "./brutalist/BrutalistCartHeader";
import { BrutalistCartItemCard } from "./brutalist/BrutalistCartItemCard";
import { BrutalistOrderSummary } from "./brutalist/BrutalistOrderSummary";
import { BrutalistEmptyCart } from "./brutalist/BrutalistEmptyCart";
import { CartLoadingSkeleton } from "./sections/CartLoadingSkeleton";
import { CartMobileCta } from "./mobile/CartMobileCta";
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
      <>
        <BrutalistCartBackground />
        <BrutalistCartLayout>
          <div className="lg:col-span-12">
            <CartLoadingSkeleton />
          </div>
        </BrutalistCartLayout>
      </>
    );
  }

  // Empty cart
  if (!cart || cart.cart_items.length === 0) {
    return (
      <>
        <BrutalistCartBackground />
        <BrutalistCartLayout>
          <BrutalistEmptyCart />
        </BrutalistCartLayout>
      </>
    );
  }

  // Cart with items
  return (
    <>
      <BrutalistCartBackground />
      <BrutalistCartLayout>
        <BrutalistCartHeader itemCount={itemCount} />

        {/* Left column: Cart items */}
        <div className="lg:col-span-8 space-y-12">
          {cart.cart_items.map((item) => (
            <BrutalistCartItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}

          <Link
            href="/create"
            className="inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 hover:opacity-100 hover:text-brandPurple transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Browsing Terminal
          </Link>
        </div>

        {/* Right column: Order summary */}
        <div className="lg:col-span-4">
          <BrutalistOrderSummary cart={cart} onCheckout={handleCheckout} />
        </div>
      </BrutalistCartLayout>

      <CartMobileCta onCheckout={handleCheckout} />
    </>
  );
}
