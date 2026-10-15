"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { FlowArtImage } from "../Mock/FlowArtImage";
import type {
  FlowProductBackdropType,
  FlowProductType,
} from "@/features/homepage/lib/types/flowPreview";

const backdropClasses: Record<FlowProductBackdropType, string> = {
  sage: "bg-(--color-flow-art-backdrop-sage)",
  sand: "bg-(--color-flow-art-backdrop-sand)",
};

interface PropsI {
  product: FlowProductType;
  isSelected: boolean;
}

/**
 * FlowProductCard
 *
 * One product tile in the demo's product grid; gains a gold frame and a
 * "Selected" badge when the scripted user picks it.
 */
export function FlowProductCard({ product, isSelected }: PropsI) {
  const t = useTranslations("home.flowPreview.product");

  return (
    <div
      className={cn(
        "relative border transition-all duration-300",
        isSelected
          ? "border-2 border-(--color-stamp-gold) bg-(--color-stamp-cream)"
          : "border-(--color-stamp-chocolate)/10 bg-(--color-stamp-white)",
      )}
    >
      {isSelected && (
        <Span
          variant="pill"
          className="animate-flow-fade absolute left-1.5 top-1.5 z-10 bg-(--color-stamp-gold) px-1.5 py-0.5 text-4xs tracking-widest text-(--color-stamp-chocolate)"
        >
          {t("selected")}
        </Span>
      )}
      <div className={cn("flex h-24 items-center justify-center sm:h-30", backdropClasses[product.backdrop])}>
        <FlowArtImage art={product.art} className="w-20 sm:w-24" />
      </div>
      <div className="flex flex-col gap-0.5 p-2 text-center">
        <Span unstyled className="truncate text-2xs text-(--color-stamp-chocolate)">
          {t(`names.${product.id}`)}
        </Span>
        <Span unstyled className="text-2xs text-(--color-stamp-chocolate)/80">
          {t(`prices.${product.id}`)}
        </Span>
      </div>
    </div>
  );
}
