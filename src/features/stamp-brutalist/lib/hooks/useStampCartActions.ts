"use client";

import { useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { StampFormData } from "../schemas/stampFormSchema";
import { useStampFlowStore } from "../context/StampFormContext";
import { useAddToCart } from "@/queries/cartQueries";
import {
  logStampInfo,
  logStampError,
  logStampWarning,
  getStampErrorMessage,
} from "../helpers/stampErrorHelpers";

export function useStampCartActions() {
  const { watch } = useFormContext<StampFormData>();
  const router = useRouter();

  const createdProductId = useStampFlowStore((s) => s.createdProductId);
  const selectedImageUrl = useStampFlowStore((s) => s.selectedImageUrl);
  const enhancedPrompt = useStampFlowStore((s) => s.enhancedPrompt);

  const addToCartMutation = useAddToCart();

  const handleAddToCart = async (buyNow: boolean = false) => {
      // Validate product exists
      if (!createdProductId) {
        toast.error("No product to add to cart");
        logStampWarning("handleAddToCart", "No created product ID available");
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

      try {
        await addToCartMutation.mutateAsync({
          product_id: createdProductId,
          quantity: 1,
          product_name: productName,
          unit_price: 0, // Will be calculated on backend
          custom_image_url: selectedImageUrl,
          variant_id: null,
        });

        logStampInfo("handleAddToCart", "Product added to cart successfully", {
          productId: createdProductId,
          buyNow,
        });

        toast.success("Added to cart!");

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

        const errorMsg = getStampErrorMessage("ADD_TO_CART_FAILED");
        toast.error(errorMsg);
        throw error;
      }
  };

  return {
    handleAddToCart,
  };
}
