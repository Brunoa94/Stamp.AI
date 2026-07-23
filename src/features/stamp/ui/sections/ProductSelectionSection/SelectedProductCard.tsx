
import Image from "next/image";
import { CheckCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
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
      className="relative overflow-hidden rounded-none whitespace-normal wrap-break-word aspect-square min-h-96 xl:min-h-128 p-6 lg:p-8 flex flex-col items-center justify-center text-center border-2 border-(--color-stamp-gold) bg-(--color-stamp-gold)/5 scale-[1.02]"
      aria-label={t("selectedAria", { name: product.name })}
    >
      <Button
        variant="outline"
        onClick={onClearSelection}
        className="absolute top-4 right-4 z-20 h-auto px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] bg-white/90 text-(--color-stamp-chocolate) border border-(--color-stamp-divider) hover:bg-white rounded-none"
        aria-label={t("removeAria")}
      >
        <X className="w-3.5 h-3.5" />
        {t("remove")}
      </Button>

      <div className="relative z-10 w-64 h-64 lg:w-80 lg:h-80 mb-6 overflow-hidden">
        <div className="relative w-full h-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 160px, 176px"
            />
          ) : (
            <div className="w-full h-full bg-(--color-stamp-cream)" />
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <Heading
          as="h4"
          variant="item"
          className="text-(--color-stamp-chocolate) mb-2 text-center leading-tight h-12 overflow-hidden line-clamp-2 flex items-center justify-center text-base md:text-lg w-full max-w-full wrap-break-word px-2"
        >
          {product.name}
        </Heading>

        <Span variant="sm" className="text-(--color-stamp-taupe) mb-4">
          ${product.price.toFixed(2)}
        </Span>

        <div className="opacity-100">
          <CheckCircle className="text-(--color-stamp-gold) w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
