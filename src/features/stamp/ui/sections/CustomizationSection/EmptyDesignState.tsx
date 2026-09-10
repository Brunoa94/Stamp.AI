"use client";

import { Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

/**
 * EmptyDesignState
 *
 * Placeholder shown when no design has been selected yet.
 * Used in both desktop and mobile preview layouts.
 */

interface PropsI {
  className?: string;
}

export function EmptyDesignState({ className }: PropsI) {
  const t = useTranslations("stamp.adjust");

  return (
    <div
      className={`aspect-4/5 bg-(--color-stamp-cream)/40 flex flex-col items-center justify-center gap-4 ${className ?? ""}`}
    >
      <Shirt className="h-24 w-24 text-(--color-stamp-taupe)/10" />
      <div className="px-8 text-center">
        <Span
          variant="micro"
          className="mb-2 block tracking-[0.3em] text-(--color-stamp-taupe)"
        >
          {t("noImageTitle")}
        </Span>
        <Span
          variant="micro"
          className="block text-[9px] normal-case tracking-normal text-(--color-stamp-taupe)/60"
        >
          {t("noImageBody")}
        </Span>
      </div>
    </div>
  );
}
