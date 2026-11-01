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

import { useCallback, useRef } from "react";
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
  const inFlight = useRef<Promise<CartWithItems> | null>(null);

  /** Resolves to the database cart's checkout view (only the selected items); its id is the cartId. */
  const persistGuestCart = useCallback((): Promise<CartWithItems> => {
    // A second click while saving reuses the running save.
    if (inFlight.current) return inFlight.current;

    const run = (async () => {
      try {
        const guest = await ensureGuestSession();
        const saved = await CartService.saveCartFromLocalItems(
          guest.id,
          LocalCartStorageService.getItems(),
        );
        const checkoutCart = CartServiceMapper.mapCartToCheckoutCart(saved);
        AnalyticsService.track("guest_payment_started", {
          items: checkoutCart.cart_items.length,
        });
        return checkoutCart;
      } catch (error) {
        captureError(error, { service: "Checkout", action: "persistGuestCart" });
        const failure = new UserFacingError(t("guestCartPersist"));
        handleError(failure);
        throw failure;
      } finally {
        inFlight.current = null;
      }
    })();

    inFlight.current = run;
    return run;
  }, [ensureGuestSession, handleError, t]);

  return { persistGuestCart };
}
