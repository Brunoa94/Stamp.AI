"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useStampNavigation } from "./useStampNavigation";
import {
  useStampFinalization,
  useStampSelectedImage,
} from "./useStampSelectors";
import { useCreateCustomProduct } from "@/queries/productQueries";
import { useUser } from "@/queries/authQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
  logStampError,
  logStampInfo,
  logStampWarn,
} from "../helpers/stampLogger";
import { withTimeout } from "@/lib/promiseUtils";

/**
 * useStampProductCreation
 *
 * Hook for handling product creation in Stamp.
 * Integrates with Printify to create custom products.
 *
 * Error Handling Pattern:
 * - Implements idempotency checks to prevent duplicate operations
 * - Uses timeout handling for long-running operations
 * - Provides clear user-facing error messages with recovery paths
 */

const PRODUCT_CREATION_TIMEOUT_MS = 120_000; // 2 minutes

class ProductCreationTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductCreationTimeoutError";
  }
}

interface CreateProductParamsType {
  blueprintId: number;
  printProviderId: number;
  fabricColor: string;
  size: string;
}

export function useStampProductCreation() {
  const t = useTranslations("stamp.errors.productCreation");
  const router = useRouter();
  const { nextStep, goToStep } = useStampNavigation();
  const { handleError } = useErrorHandler();

  const { selectedImageUrl, enhancedPrompt } = useStampSelectedImage();
  const {
    setIsFinalizing,
    setCreatedProductId,
    setCreatedVariantId,
    setMockupImageUrl,
    setProductionProgress,
  } = useStampFinalization();

  const createProductMutation = useCreateCustomProduct();
  const { data: user } = useUser();

  // Idempotency: Track if creation is in progress to prevent duplicates
  const isCreatingRef = useRef(false);

  const handleCreateProduct = async ({
    blueprintId,
    printProviderId,
    fabricColor,
    size,
  }: CreateProductParamsType) => {
    // Idempotency check: Prevent duplicate operations
    if (isCreatingRef.current) {
      logStampWarn({
        scope: "useStampProductCreation",
        event: "duplicate_product_creation_ignored",
        metadata: {
          blueprintId,
          printProviderId,
          fabricColor,
          size,
        },
      });
      return;
    }

    // Check sessionStorage for completed operations
    const operationKey =
      `stamp_product_${blueprintId}_${printProviderId}_${fabricColor}_${size}`;
    const completedKey = `${operationKey}_completed`;

    if (sessionStorage.getItem(completedKey) === "true") {
      logStampInfo({
        scope: "useStampProductCreation",
        event: "product_creation_already_completed",
        metadata: {
          blueprintId,
          printProviderId,
          fabricColor,
          size,
        },
      });
      toast.info(t("alreadyCreated"));
      nextStep();
      return;
    }

    // Validate required data
    if (!selectedImageUrl) {
      handleError(new Error(t("noDesign")));
      goToStep(2);
      return;
    }

    if (!blueprintId || !printProviderId) {
      handleError(new Error(t("noProduct")));
      goToStep(5);
      return;
    }

    if (!fabricColor || !size) {
      handleError(new Error(t("noColorSize")));
      return;
    }

    // Validate authentication
    if (!user) {
      handleError(new Error(t("notLoggedIn")));
      router.push("/auth/login");
      return;
    }

    // Set idempotency lock
    isCreatingRef.current = true;

    setIsFinalizing(true);
    setProductionProgress(0);
    // Clear previous mockup to prevent stale image flash on FinalReviewSection
    setMockupImageUrl(undefined);

    // Navigate to production step
    nextStep();

    // Simulate production progress
    const progressInterval = setInterval(() => {
      setProductionProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 600);

    try {
      // Wrap mutation with timeout
      const product = await withTimeout(
        createProductMutation.mutateAsync({
          blueprint_id: blueprintId,
          print_provider_id: printProviderId,
          image_url: selectedImageUrl,
          title: enhancedPrompt || "Custom Design",
          description: enhancedPrompt || "AI-generated custom design",
          user_id: user.id,
          customer_email: user.email || "",
          selected_color: fabricColor,
          selected_size: size,
        }),
        PRODUCT_CREATION_TIMEOUT_MS,
        new ProductCreationTimeoutError(
          t("timeout", {
            seconds: Math.round(PRODUCT_CREATION_TIMEOUT_MS / 1000),
          }),
        ),
      );

      logStampInfo({
        scope: "useStampProductCreation",
        event: "product_creation_succeeded",
        metadata: {
          blueprintId,
          printProviderId,
          fabricColor,
          size,
          createdProductId: product.id,
        },
      });

      clearInterval(progressInterval);
      setProductionProgress(100);

      // Mark operation as completed for idempotency
      sessionStorage.setItem(completedKey, "true");

      // Store product data
      setCreatedProductId(product.id);

      // Store first variant ID for cart
      if (product.variants && product.variants.length > 0) {
        const firstVariantId = product.variants[0].id;
        setCreatedVariantId(firstVariantId);
      }

      // Store mockup image URL
      if (product.images && product.images.length > 0) {
        const mockupUrl = product.images[0].src;
        setMockupImageUrl(mockupUrl);
      }

      // Advance to final review after showing production animation
      setTimeout(() => {
        nextStep();
      }, 1500);

      return product;
    } catch (error) {
      clearInterval(progressInterval);
      setProductionProgress(0);

      if (error instanceof ProductCreationTimeoutError) {
        logStampError({
          scope: "useStampProductCreation",
          event: "product_creation_timeout",
          error,
          metadata: {
            blueprintId,
            printProviderId,
            fabricColor,
            size,
            timeoutMs: PRODUCT_CREATION_TIMEOUT_MS,
          },
        });
        handleError(error);
      } else {
        logStampError({
          scope: "useStampProductCreation",
          event: "product_creation_failed",
          error,
          metadata: {
            blueprintId,
            printProviderId,
            fabricColor,
            size,
          },
        });
      }

      // Go back to customization step on error
      goToStep(6);
      throw error;
    } finally {
      setIsFinalizing(false);
      isCreatingRef.current = false;
    }
  };

  return {
    handleCreateProduct,
    isFinalizing: createProductMutation.isPending,
  };
}
