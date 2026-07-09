/**
 * CartV2Content
 *
 * Presentational container for the luxury brutalist cart. Data and handlers
 * come from the useCartV2 lib hook; this component only chooses between the
 * loading / empty / populated layouts.
 */

"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCartV2 } from "../lib/hooks/useCartV2";
import { CartV2Layout } from "./components/CartV2Layout";
import { CartV2Header } from "./components/CartV2Header";
import { CartV2MobileCta } from "./components/CartV2MobileCta";
import { CartV2ItemCard } from "./sections/CartV2ItemCard/CartV2ItemCard";
import { CartV2OrderSummary } from "./sections/CartV2OrderSummary/CartV2OrderSummary";
import { CartV2EmptySection } from "./sections/CartV2EmptySection";
import { CartV2LoadingSection } from "./sections/CartV2LoadingSection";

export function CartV2Content() {
  const {
    cart,
    itemCount,
    isLoading,
    total,
    updateQuantity,
    removeItem,
    checkout,
  } = useCartV2();

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

  return (
    <>
      <CartV2Layout>
        <CartV2Header itemCount={itemCount} />

        <div className="space-y-8 xl:col-span-8">
          {cart.cart_items.map((item) => (
            <CartV2ItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
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
          <CartV2OrderSummary cart={cart} onCheckout={checkout} />
        </div>
      </CartV2Layout>

      <CartV2MobileCta total={total} onCheckout={checkout} />
    </>
  );
}
