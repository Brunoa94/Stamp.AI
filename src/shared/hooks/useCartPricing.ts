"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/shared/queries/authQueries";
import { applyQuoteToCart, CheckoutQuoteService, quoteLineItems } from "@/shared/services/checkoutQuoteService";
import type { CartWithItems } from "@/shared/types/cart";

export function useCartPricing(cart: CartWithItems | null | undefined, promoCode?: string) {
  const { data: user, isLoading: authLoading } = useUser();
  const lines = cart ? quoteLineItems(cart) : [];
  const query = useQuery({
    queryKey: ["checkout-quote", user?.id, lines, promoCode ?? ""],
    queryFn: async () => {
      const quote = await CheckoutQuoteService.quote(lines, promoCode);
      if (cart) applyQuoteToCart(cart, quote);
      return quote;
    },
    enabled: !!user && lines.length > 0,
    staleTime: 0, retry: false, refetchOnMount: "always", refetchOnWindowFocus: true,
  });
  return { ...query,
    cart: cart && query.data ? applyQuoteToCart(cart, query.data) : cart,
    isPricing: authLoading || (!!user && lines.length > 0 && query.isFetching),
    pricingUnavailable: !user || (lines.length > 0 && (!query.data || !!query.error)),
  };
}
