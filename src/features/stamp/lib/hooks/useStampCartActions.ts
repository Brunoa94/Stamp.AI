"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  useStampFinalization,
  useStampSelectedImage,
  useStampCustomization,
  useStampProductSelection,
} from "./useStampSelectors";
import { useAddToCart } from "@/queries/cartQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
  logStampError,
  logStampInfo,
  logStampWarn,
} from "../helpers/stampLogger";

/**
 * useStampCartActions
 *
 * Hook for handling cart actions in Stamp.
 * Adds created products to cart and navigates to checkout.
 *
 * Error Handling Pattern:
 * - Implements idempotency checks to prevent duplicate cart additions
 * - Provides clear user-facing error messages with recovery paths
 */

export function useStampCartActions() {
  const t = useTranslations("stamp.errors.cart");
  const router = useRouter();
  const { handleError, handleSuccess } = useErrorHandler();

  const { createdProductId, createdVariantId, mockupImageUrl } = useStampFinalization();
  const { selectedImageUrl } = useStampSelectedImage();
  const { selectedPriceCents } = useStampCustomization();
  const { selectedProductTitle } = useStampProductSelection();

  const addToCartMutation = useAddToCart();

  // Idempotency: Track if add to cart is in progress to prevent duplicates
  const isAddingRef = useRef(false);

  const handleAddToCart = async (buyNow: boolean = false) => {
    // Idempotency check: Prevent duplicate cart additions
    if (isAddingRef.current) {
      logStampWarn({
        scope: "useStampCartActions",
        event: "duplicate_add_to_cart_ignored",
        metadata: { buyNow },
      });
      return;
    }

    // Check sessionStorage for completed operations (per product)
    const cartOperationKey =
      `stamp_cart_${createdProductId}_${createdVariantId}`;

    if (sessionStorage.getItem(cartOperationKey) === "true") {
      logStampInfo({
        scope: "useStampCartActions",
        event: "add_to_cart_already_completed",
        metadata: {
          buyNow,
          createdProductId,
          createdVariantId,
        },
      });
      toast.info(t("alreadyInCart"));

      if (buyNow) {
        router.push("/checkout");
      } else {
        router.push("/cart");
      }
      return;
    }

    // Validate product exists
    if (!createdProductId) {
      logStampWarn({
        scope: "useStampCartActions",
        event: "missing_created_product_id",
        metadata: { buyNow },
      });
      handleError(new Error(t("noProduct")));
      return;
    }

    // Validate variant ID
    if (!createdVariantId) {
      logStampWarn({
        scope: "useStampCartActions",
        event: "missing_created_variant_id",
        metadata: {
          buyNow,
          createdProductId,
        },
      });
      handleError(new Error(t("noVariant")));
      return;
    }

    // Set idempotency lock
    isAddingRef.current = true;

    const productName = selectedProductTitle || "Custom Design";

    // Use actual price from customization selection (in cents)
    // Default to 1999 cents ($19.99) if no price selected
    const unitPrice = selectedPriceCents ?? 1999;

    // Build cart item payload
    const cartItemPayload = {
      product_id: createdProductId,
      quantity: 1,
      product_name: productName,
      unit_price: unitPrice,
      custom_image_url: mockupImageUrl || selectedImageUrl,
      variant_id: createdVariantId.toString(),
    };

    // DEBUG: Log the exact payload being sent to cart
    logStampInfo({
      scope: "useStampCartActions",
      event: "add_to_cart_payload",
      metadata: {
        buyNow,
        payload: cartItemPayload,
        rawValues: {
          selectedProductTitle,
          selectedPriceCents,
          selectedImageUrl,
          mockupImageUrl,
          createdProductId,
          createdVariantId,
        },
      },
    });

    // Validate critical fields before sending
    if (!cartItemPayload.product_name) {
      logStampError({
        scope: "useStampCartActions",
        event: "missing_product_name_in_payload",
        error: new Error("product_name is missing from cart payload"),
        metadata: { payload: cartItemPayload },
      });
    }

    if (typeof cartItemPayload.unit_price !== "number" || cartItemPayload.unit_price <= 0) {
      logStampError({
        scope: "useStampCartActions",
        event: "invalid_unit_price_in_payload",
        error: new Error(`unit_price is invalid: ${cartItemPayload.unit_price}`),
        metadata: { payload: cartItemPayload },
      });
    }

    try {
      await addToCartMutation.mutateAsync(cartItemPayload);

      // Mark operation as completed for idempotency
      sessionStorage.setItem(cartOperationKey, "true");

      logStampInfo({
        scope: "useStampCartActions",
        event: "add_to_cart_succeeded",
        metadata: {
          buyNow,
          createdProductId,
          createdVariantId,
        },
      });

      handleSuccess(t("added"));

      // Navigate based on action
      if (buyNow) {
        router.push("/checkout");
      } else {
        router.push("/cart");
      }
    } catch (error) {
      logStampError({
        scope: "useStampCartActions",
        event: "add_to_cart_failed",
        error,
        metadata: {
          buyNow,
          createdProductId,
          createdVariantId,
        },
      });
    } finally {
      isAddingRef.current = false;
    }
  };

  const handleBagIt = () => handleAddToCart(false);
  const handleBuyNow = () => handleAddToCart(true);

  return {
    handleAddToCart,
    handleBagIt,
    handleBuyNow,
    isAddingToCart: addToCartMutation.isPending,
  };
}
