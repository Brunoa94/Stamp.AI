/**
 * useCheckoutCart
 *
 * Resolves the checkout cart from the `cartId` search param via the shared
 * cart query, keeping CheckoutContent free of data-plumbing.
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useCartById } from "@/queries/cartQueries";

export function useCheckoutCart() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId");
  const { data: cart, isLoading, error } = useCartById(cartId || "");

  return { cartId, cart, isLoading, error };
}
