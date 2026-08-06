
import Image from "next/image";
import { CheckCircle, X, Sparkles, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";

/**
 * SelectedProductCard
 *
 * Displays the currently selected product in expanded view.
 * Allows user to clear the selection.
 */

interface PropsI {
  product: CatalogProductMappedType;
  onClearSelection: () => void;
}

export function SelectedProductCard({ product, onClearSelection }: PropsI) {
  const t = useTranslations("stamp.productSelection");

  return (
    <div
      className="relative overflow-hidden rounded-none whitespace-normal wrap-break-word min-h-80 sm:min-h-96 md:min-h-105 lg:min-h-120 xl:min-h-130 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center border-2 border-(--color-stamp-gold) bg-(--color-stamp-gold)/5"
      aria-label={t("selectedAria", { name: product.name })}
    >
      {/* Selected badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-(--color-stamp-gold) text-white text-[10px] font-bold uppercase tracking-widest">
        <CheckCircle className="w-3 h-3" />
        {t("selectedBadge")}
      </div>

      <Button
        variant="outline"
        onClick={onClearSelection}
        className="absolute top-4 right-4 z-20 h-auto px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] bg-white/90 text-(--color-stamp-chocolate) border border-(--color-stamp-divider) hover:bg-white rounded-none"
        aria-label={t("removeAria")}
      >
        <X className="w-3.5 h-3.5" />
        {t("remove")}
      </Button>

      {/* Larger image container */}
      <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 mb-6 overflow-hidden">
        <div className="relative w-full h-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, (max-width: 1024px) 288px, (max-width: 1280px) 320px, 384px"
            />
          ) : (
            <div className="w-full h-full bg-(--color-stamp-cream)" />
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        <Heading
          as="h4"
          variant="item"
          className="text-(--color-stamp-chocolate) mb-2 text-center leading-tight overflow-hidden line-clamp-2 flex items-center justify-center text-lg md:text-xl w-full max-w-full wrap-break-word px-2"
        >
          {product.name}
        </Heading>

        <Span variant="sm" className="text-(--color-stamp-chocolate) text-xl mb-4">
          €{product.price.toFixed(2)}
        </Span>

        {/* Additional info section */}
        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-center gap-2 text-(--color-stamp-taupe)">
            <Sparkles className="w-4 h-4 text-(--color-stamp-gold)" />
            <Paragraph variant="sm">{t("qualityNote")}</Paragraph>
          </div>
          <div className="flex items-center justify-center gap-2 text-(--color-stamp-taupe)">
            <Palette className="w-4 h-4 text-(--color-stamp-gold)" />
            <Paragraph variant="sm">{t("customizeNext")}</Paragraph>
          </div>
        </div>
      </div>
    </div>
  );
}
