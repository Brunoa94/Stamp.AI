"use client";

import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { OrderService } from "@/services/orderService";
import { fetchRemoteImageBlob } from "@/services/imageProxyService";
import type {
  FormState,
  GeneratedHistoryItem,
  NavigationState,
} from "../context/types";

interface NavigationStoreLike {
  getState: () => NavigationState;
  setState: (newState: NavigationState) => void;
}

interface FormStoreLike {
  getState: () => FormState;
  setState: (newState: FormState) => void;
}

interface UseHydrateFromOrderReuseParams {
  searchParams: ReadonlyURLSearchParams;
  formStore: FormStoreLike;
  navigationStore: NavigationStoreLike;
  storageKey: string;
}

export function useHydrateFromOrderReuse({
  searchParams,
  formStore,
  navigationStore,
  storageKey,
}: UseHydrateFromOrderReuseParams) {
  useEffect(() => {
    const sourceOrderId = searchParams.get("sourceOrder");
    const sourceOrderItemId = searchParams.get("sourceOrderItem");

    if (!sourceOrderId) return;

    let cancelled = false;

    const hydrateFromOrder = async () => {
      try {
        const order = await OrderService.getOrder(sourceOrderId);
        if (cancelled) return;

        const reusableItem = sourceOrderItemId
          ? order.order_items?.find((item) => item.id === sourceOrderItemId)
          : undefined;

        const fallbackItem =
          order.order_items?.find((item) => Boolean(item.custom_image_url)) ||
          order.order_items?.[0];

        const targetItem = reusableItem || fallbackItem;
        const reusableImageUrl = targetItem?.custom_image_url;

        if (!reusableImageUrl) return;

        const imageBlob = await fetchRemoteImageBlob(reusableImageUrl);
        if (!imageBlob) return;
        if (cancelled) return;

        const fallbackMimeType = "image/png";
        const mimeType = imageBlob.type || fallbackMimeType;
        const fileExt = mimeType.split("/")[1] || "png";
        const reusableFile = new File(
          [imageBlob],
          `order-${order.id}-${targetItem?.id || "item"}.${fileExt}`,
          { type: mimeType },
        );

        const current = formStore.getState();

        const historyEntry: GeneratedHistoryItem = {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: Date.now(),
          imageUrl: reusableImageUrl,
          enhancedPrompt: `Reused from order ${order.order_number || order.id}`,
          originalPrompt: `Reused from order ${order.order_number || order.id}`,
        };

        const dedupedHistory = [
          historyEntry,
          ...current.generatedHistory.filter(
            (item) => item.imageUrl !== reusableImageUrl,
          ),
        ].slice(0, 20);

        formStore.setState({
          ...current,
          uploadedImage: reusableFile,
          generatedResult: null,
          generatedHistory: dedupedHistory,
          generationError: null,
        });

        current.form?.setValue("image", reusableFile, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });

        navigationStore.setState({
          ...navigationStore.getState(),
          currentStep: "upload",
        });

        if (typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, JSON.stringify(dedupedHistory));
        }
      } catch {
        // Silent fail: if order cannot be loaded, user keeps normal flow.
      }
    };

    void hydrateFromOrder();

    return () => {
      cancelled = true;
    };
  }, [formStore, navigationStore, searchParams, storageKey]);
}
