"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import type { FlowToastType } from "@/features/homepage/lib/types/flowPreview";

interface PropsI {
  type: Exclude<FlowToastType, null>;
}

/**
 * FlowToast
 *
 * Success toast that slides into the demo window's bottom-right corner.
 */
export function FlowToast({ type }: PropsI) {
  const t = useTranslations("home.flowPreview.toasts");

  return (
    <div className="animate-flow-toast absolute bottom-4 right-4 flex items-center gap-2.5 border-l-3 border-(--color-stamp-success) bg-(--color-stamp-white) px-4 py-3 shadow-lg shadow-(--color-stamp-chocolate)/15">
      <Span unstyled className="flex size-4.5 items-center justify-center rounded-full bg-(--color-stamp-chocolate)">
        <Check className="size-2.5 text-(--color-stamp-white)" strokeWidth={3.5} />
      </Span>
      <Span unstyled className="text-xs text-(--color-stamp-chocolate)">
        {t(type)}
      </Span>
    </div>
  );
}
