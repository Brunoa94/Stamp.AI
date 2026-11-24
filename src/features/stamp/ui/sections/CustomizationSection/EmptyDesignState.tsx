"use client";

import { Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

/**
 * EmptyDesignState
 *
 * Placeholder shown when no design has been selected yet: a cream rounded
 * panel with a product outline and a short hint.
 * Used in both desktop and mobile preview layouts.
 */

interface PropsI {
  className?: string;
}

export function EmptyDesignState({ className }: PropsI) {
  const t = useTranslations("stamp.adjust");

  return (
    <div
      className={cn(
        "aspect-4/5 rounded-2xl bg-(--color-stamp-cream) flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <Shirt className="h-24 w-24 text-(--color-stamp-taupe)/20" />
      <div className="px-8 text-center">
        <Span as="p" variant="label" className="mb-2 text-(--color-stamp-taupe)">
          {t("noImageTitle")}
        </Span>
        <Span as="p" variant="micro" className="text-(--color-stamp-taupe)">
          {t("noImageBody")}
        </Span>
      </div>
    </div>
  );
}
