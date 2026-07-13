"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useStampFinalization,
  useStampSelectedImage,
  useStampCustomization,
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
  const router = useRouter();
  const { handleError, handleSuccess } = useErrorHandler();

  const { createdProductId, createdVariantId } = useStampFinalization();
  const { selectedImageUrl, enhancedPrompt } = useStampSelectedImage();
  const { selectedPriceCents } = useStampCustomization();

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
      toast.info("Product already in cart. Navigating...");

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
      handleError(
        new Error("Please create a product first before adding to cart"),
      );
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
      handleError(
        new Error(
          "Product variant not found. Please try creating the product again.",
        ),
      );
      return;
    }

    // Set idempotency lock
    isAddingRef.current = true;

    const productName = enhancedPrompt || "Custom Design";

    // Use actual price from customization selection (in cents)
    // Default to 1999 cents ($19.99) if no price selected
    const unitPrice = selectedPriceCents ?? 1999;

    try {
      await addToCartMutation.mutateAsync({
        product_id: createdProductId,
        quantity: 1,
        product_name: productName,
        unit_price: unitPrice,
        custom_image_url: selectedImageUrl,
        variant_id: createdVariantId.toString(),
      });

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

      handleSuccess("Added to cart!");

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
