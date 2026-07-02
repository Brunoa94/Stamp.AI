"use client";

import { useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { StampFormData } from "../schemas/stampFormSchema";
import { useStampFlowStore } from "../context/StampFormContext";
import { useAddToCart } from "@/queries/cartQueries";
import {
  logStampError,
  logStampInfo,
  logStampWarning,
} from "../helpers/stampErrorHelpers";

export function useStampCartActions() {
  const { watch } = useFormContext<StampFormData>();
  const router = useRouter();
  const { handleError, handleSuccess } = useErrorHandler();

  const createdProductId = useStampFlowStore((s) => s.createdProductId);
  const createdVariantId = useStampFlowStore((s) => s.createdVariantId);
  const selectedImageUrl = useStampFlowStore((s) => s.selectedImageUrl);
  const enhancedPrompt = useStampFlowStore((s) => s.enhancedPrompt);

  const addToCartMutation = useAddToCart();

  const handleAddToCart = async (buyNow: boolean = false) => {
    // Validate product exists
    if (!createdProductId) {
      logStampWarning("handleAddToCart", "No created product ID available", {
        createdProductId,
        selectedImageUrl,
        enhancedPrompt,
      });
      handleError(new Error("Please create a product first before adding to cart"));
      return;
    }

    const formData = watch();
    const productName = enhancedPrompt || formData.prompt || "Custom Design";

    logStampInfo("handleAddToCart", "Adding product to cart", {
      productId: createdProductId,
      productName,
      buyNow,
      hasCustomImage: !!selectedImageUrl,
    });

    // Use a default base price in cents (should ideally come from product data)
    // 80 cents = $0.80
    const unitPrice = 80;

    // Validate variant ID is available
    if (!createdVariantId) {
      logStampWarning("handleAddToCart", "No variant ID available", {
        createdProductId,
        createdVariantId,
      });
      handleError(new Error("Product variant not found. Please try creating the product again."));
      return;
    }

    console.log("[STAMP] Adding to cart with payload:", {
      product_id: createdProductId,
      quantity: 1,
      product_name: productName,
      unit_price: unitPrice,
      custom_image_url: selectedImageUrl,
      variant_id: createdVariantId,
    });

    try {
      const result = await addToCartMutation.mutateAsync({
        product_id: createdProductId,
        quantity: 1,
        product_name: productName,
        unit_price: unitPrice,
        custom_image_url: selectedImageUrl,
        variant_id: createdVariantId.toString(),
      });

      logStampInfo("handleAddToCart", "Product added to cart successfully", {
        productId: createdProductId,
        result,
        buyNow,
      });

      handleSuccess("Added to cart!");

      // Navigate based on action
      if (buyNow) {
        logStampInfo("handleAddToCart", "Navigating to checkout");
        router.push("/checkout");
      } else {
        logStampInfo("handleAddToCart", "Navigating to cart");
        router.push("/cart");
      }
    } catch (error) {
      logStampError("handleAddToCart", error, {
        productId: createdProductId,
        buyNow,
      });
      // Error already handled by useAddToCart mutation's onError callback
      // No need to call handleError or re-throw here
    }
  };

  return {
    handleAddToCart,
  };
}
