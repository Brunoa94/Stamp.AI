/**
 * usePersistGuestCart
 *
 * Just before a guest's payment starts, copies their local cart into the
 * database cart owned by their anonymous user (starting that session if
 * needed), so the existing payment flow and return pages run unchanged. The
 * local cart stays as it is: it is only cleared once a return page confirms
 * the order.
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEnsureGuestSession } from "@/shared/queries/authQueries";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { CartService } from "@/shared/services/cartService";
import { LocalCartStorageService } from "@/shared/services/localCartStorageService";
import { AnalyticsService } from "@/shared/services/analyticsService";
import { CartServiceMapper } from "@/shared/mappers/services/cartServiceMapper";
import { UserFacingError } from "@/shared/errors/UserFacingError";
import { captureError } from "@/lib/observability/errorCapture";
import type { CartWithItems } from "@/shared/types/cart";

export function usePersistGuestCart() {
  const t = useTranslations("checkout.errors");
  const ensureGuestSession = useEnsureGuestSession();
  const { handleError } = useErrorHandler();

  const { mutateAsync, isPending } = useMutation({
    /** Resolves to the database cart's checkout view (only the selected items); its id is the cartId. */
    mutationFn: async (): Promise<CartWithItems> => {
      const guest = await ensureGuestSession();
      const saved = await CartService.saveCartFromLocalItems(guest.id, LocalCartStorageService.getItems());

      return CartServiceMapper.mapCartToCheckoutCart(saved);
    },
    onSuccess: (checkoutCart) => {
      AnalyticsService.track("guest_payment_started", { items: checkoutCart.cart_items.length });
    },
    onError: (error: Error) => {
      captureError(error, { service: "Checkout", action: "persistGuestCart" });
      handleError(new UserFacingError(t("guestCartPersist")));
    },
  });

  return { persistGuestCart: () => mutateAsync(), isPending };
}
