"use client";

import { useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { StampFormData } from "../schemas/stampFormSchema";
import { useStampFlowStore } from "../context/StampFormContext";
import { useCreateCustomProduct } from "@/queries/productQueries";
import { useUser } from "@/queries/authQueries";
import {
  getStampErrorMessage,
  logStampError,
  logStampInfo,
  logStampWarning,
} from "../helpers/stampErrorHelpers";
import { mapToProductCreationPayload } from "../mappers/productCreationMapper";

/**
 * Hook for handling stamp product creation flow
 * Manages validation, product creation, and step progression
 */
export function useStampProductCreation() {
  const { watch } = useFormContext<StampFormData>();
  const router = useRouter();

  const setCurrentStep = useStampFlowStore((s) => s.setCurrentStep);
  const isFinalizing = useStampFlowStore((s) => s.isFinalizing);
  const setIsFinalizing = useStampFlowStore((s) => s.setIsFinalizing);
  const selectedImageUrl = useStampFlowStore((s) => s.selectedImageUrl);
  const enhancedPrompt = useStampFlowStore((s) => s.enhancedPrompt);
  const setCreatedProductId = useStampFlowStore((s) => s.setCreatedProductId);
  const setMockupImageUrl = useStampFlowStore((s) => s.setMockupImageUrl);

  const createProductMutation = useCreateCustomProduct();
  const { data: user } = useUser();

  const handleCreateProduct = async () => {
    const formData = watch();

    // Validate required selections
    if (!validateSelections(formData, selectedImageUrl)) {
      return;
    }

    // Validate authentication
    if (!validateAuthentication(user, router)) {
      return;
    }

    setIsFinalizing(true);

    // Auto-advance to production/mockup generation step
    setCurrentStep(7);
    advanceToStep(7);

    try {
      const payload = mapToProductCreationPayload(
        formData,
        selectedImageUrl!,
        enhancedPrompt,
        user!.id,
        user!.email,
      );

      logStampInfo("handleCreateProduct", "Creating product with payload", {
        blueprintId: payload.blueprint_id,
        printProviderId: payload.print_provider_id,
        hasImageUrl: !!payload.image_url,
        userId: payload.user_id,
      });

      const product = await createProductMutation.mutateAsync(payload);

      logStampInfo("handleCreateProduct", "Product created successfully", {
        productId: product.id,
        hasImages: !!product.images,
        imagesCount: product.images?.length || 0,
      });

      // Store product data
      setCreatedProductId(product.id);

      // Store mockup image URL
      if (product.images && product.images.length > 0) {
        const mockupUrl = product.images[0].src;
        logStampInfo("handleCreateProduct", "Storing mockup image URL", {
          mockupUrl,
        });
        setMockupImageUrl(mockupUrl);
      } else {
        logStampWarning(
          "handleCreateProduct",
          "No mockup images in product response",
        );
      }

      // Advance to final review after showing production animation
      setTimeout(() => {
        setCurrentStep(8);
        advanceToStep(8);
      }, 2000);

      return product;
    } catch (error) {
      logStampError("handleCreateProduct", error, {
        blueprintId: formData.blueprintId,
        printProviderId: formData.printProviderId,
        userId: user?.id,
      });

      const errorMsg = getStampErrorMessage("PRODUCT_CREATION_FAILED");
      toast.error(errorMsg);

      // Go back to customization step on error
      setCurrentStep(6);
      throw error;
    } finally {
      setIsFinalizing(false);
    }
  };

  return {
    handleCreateProduct,
    isFinalizing,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates required form selections
 */
function validateSelections(
  formData: StampFormData,
  selectedImageUrl: string | undefined,
): boolean {
  if (!formData.selectedColor || !formData.selectedSize || !selectedImageUrl) {
    const errorMsg = getStampErrorMessage("MISSING_COLOR_SIZE");
    toast.error(errorMsg);
    logStampWarning(
      "validateSelections",
      "Missing color, size, or image selection",
      {
        hasColor: !!formData.selectedColor,
        hasSize: !!formData.selectedSize,
        hasImage: !!selectedImageUrl,
      },
    );
    return false;
  }

  if (!formData.blueprintId || !formData.printProviderId) {
    const errorMsg = getStampErrorMessage("MISSING_PRODUCT_SELECTION");
    toast.error(errorMsg);
    logStampWarning("validateSelections", "Missing blueprint or provider", {
      hasBlueprintId: !!formData.blueprintId,
      hasPrintProviderId: !!formData.printProviderId,
    });
    return false;
  }

  return true;
}

/**
 * Validates user authentication
 */
function validateAuthentication(
  user: { id: string; email: string } | undefined | null,
  router: ReturnType<typeof useRouter>,
): boolean {
  if (!user?.id || !user?.email) {
    toast.error("You must be logged in to create a product");
    logStampWarning("validateAuthentication", "User not authenticated");
    router.push("/auth/login");
    return false;
  }
  return true;
}

/**
 * Advances to a specific step with smooth scroll
 */
function advanceToStep(step: number): void {
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    const section = document.getElementById(`step-${step}`);
    section?.scrollIntoView({ behavior: "smooth" });
  });
}
