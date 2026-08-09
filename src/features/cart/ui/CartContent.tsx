/**
 * CartContent
 *
 * Presentational container for the luxury brutalist cart. Data and handlers
 * come from the useCart lib hook; this component only chooses between the
 * loading / empty / populated layouts.
 */

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "../lib/hooks/useCart";
import { CartLayout } from "./components/CartLayout";
import { CartHeader } from "./components/CartHeader";
import { CartMobileCta } from "./components/CartMobileCta";
import { CartItemCard } from "./sections/CartItemCard/CartItemCard";
import { CartOrderSummary } from "./sections/CartOrderSummary/CartOrderSummary";
import { CartEmptySection } from "./sections/CartEmptySection";
import { CartLoadingSection } from "./sections/CartLoadingSection";
import { AnalyticsService } from "@/services/analyticsService";
import { mapViewCartEvent } from "@/features/analytics/mappers/ecommerceMappers";

export function CartContent() {
  const t = useTranslations("cart.content");
  const {
    cart,
    itemCount,
    isLoading,
    total,
    updateQuantity,
    removeItem,
    checkout,
  } = useCart();

  // Track view_cart once when cart is loaded with items
  const hasTrackedViewCart = useRef(false);
  useEffect(() => {
    if (!isLoading && cart && cart.cart_items.length > 0 && !hasTrackedViewCart.current) {
      hasTrackedViewCart.current = true;
      AnalyticsService.track(
        "view_cart",
        mapViewCartEvent({ items: cart.cart_items, value: total })
      );
    }
  }, [isLoading, cart, total]);

  if (isLoading) {
    return (
      <CartLayout>
        <CartLoadingSection />
      </CartLayout>
    );
  }

  if (!cart || cart.cart_items.length === 0) {
    return (
      <CartLayout>
        <CartEmptySection />
      </CartLayout>
    );
  }

  return (
    <>
      <CartLayout>
        <CartHeader itemCount={itemCount} />

        <div className="space-y-8 xl:col-span-8">
          {cart.cart_items.map((item) => (
            <CartItemCard
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
            {t("continueBrowsing")}
          </Link>
        </div>

        <div className="xl:col-span-4">
          <CartOrderSummary cart={cart} onCheckout={checkout} />
        </div>
      </CartLayout>

      <CartMobileCta total={total} onCheckout={checkout} />
    </>
  );
}
