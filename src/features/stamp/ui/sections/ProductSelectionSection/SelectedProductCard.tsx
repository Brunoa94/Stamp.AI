import { useMemo } from "react";
import Image from "next/image";
import { CheckCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { extractProductSpecs } from "@/lib/seo/productDescription";
import { ProductSpecsList } from "./ProductSpecsList";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";

/**
 * SelectedProductCard
 *
 * Displays the currently selected product in expanded view: the image and
 * its details share one column, so the name, price and specs line up with
 * the image edges. Allows the user to clear the selection.
 */

interface PropsI {
  product: CatalogProductMappedType;
  onClearSelection: () => void;
}

export function SelectedProductCard({ product, onClearSelection }: PropsI) {
  const t = useTranslations("stamp.productSelection");

  const specs = useMemo(() => {
    return extractProductSpecs({ printify_description: product.printifyDescription });
  }, [product.printifyDescription]);

  return (
    <div
      className="relative overflow-hidden rounded-none whitespace-normal wrap-break-word px-4 pt-16 pb-8 sm:px-6 lg:px-8 lg:pb-10 flex flex-col items-center border-2 border-(--color-stamp-gold) bg-(--color-stamp-gold)/5"
      aria-label={t("selectedAria", { name: product.name })}
    >
      {/* Selected badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-(--color-stamp-gold) text-white text-xs font-bold uppercase tracking-widest">
        <CheckCircle className="w-3.5 h-3.5" />
        {t("selectedBadge")}
      </div>

      <Button
        variant="outline"
        onClick={onClearSelection}
        className="absolute top-4 right-4 z-20 h-auto px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] bg-white/90 text-(--color-stamp-chocolate) border border-(--color-stamp-divider) hover:bg-white rounded-none"
        aria-label={t("removeAria")}
      >
        <X className="w-3.5 h-3.5" />
        {t("remove")}
      </Button>

      {/* Image and details share this column's width */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm xl:max-w-md">
        <div className="relative aspect-square w-full mb-6 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 320px, (max-width: 1280px) 384px, 448px"
            />
          ) : (
            <div className="w-full h-full bg-(--color-stamp-cream)" />
          )}
        </div>

        <div className="flex w-full items-baseline justify-between gap-4 border-t-2 border-(--color-stamp-chocolate) pt-5">
          <Heading
            as="h3"
            variant="item"
            className="text-(--color-stamp-chocolate) text-left leading-tight line-clamp-2 text-2xl md:text-3xl wrap-break-word"
          >
            {product.name}
          </Heading>

          <Span
            variant="value"
            className="shrink-0 text-xl md:text-2xl text-(--color-stamp-chocolate)"
          >
            €{product.price.toFixed(2)}
          </Span>
        </div>

        {specs.length > 0 && <ProductSpecsList specs={specs} />}
      </div>
    </div>
  );
}
