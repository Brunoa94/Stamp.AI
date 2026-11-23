
import Image from "next/image";
import { CheckCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { stampCardVariants } from "../../../lib/variants/stampStudioVariants";
import type { CatalogProductMappedT } from "../../../lib/types/stampTypes";
import { ExpandableSpecsList } from "./ExpandableSpecsList";

/**
 * SelectedProductCard
 *
 * The picked product in a white rounded card with the amber "selected"
 * border and badge, its photo, name, price and specs. Allows the user to
 * clear the selection.
 */

interface PropsI {
  product: CatalogProductMappedT;
  onClearSelection: () => void;
}

export function SelectedProductCard({ product, onClearSelection }: PropsI) {
  const t = useTranslations("stamp.productSelection");

  const { specs } = product;

  return (
    <div
      className={cn(
        stampCardVariants(),
        "relative overflow-hidden whitespace-normal wrap-break-word min-h-80 sm:min-h-96 md:min-h-105 lg:min-h-120 xl:min-h-130 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center border-(--color-stamp-gold) ring-1 ring-(--color-stamp-gold)",
      )}
      aria-label={t("selectedAria", { name: product.displayName })}
    >
      {/* Selected badge */}
      <Span
        variant="badge"
        className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-md bg-(--color-stamp-gold) px-2 py-1 text-(--color-stamp-chocolate)"
      >
        <CheckCircle className="w-3 h-3" />
        {t("selectedBadge")}
      </Span>

      <Button
        variant="secondary-compact"
        onClick={onClearSelection}
        className="absolute top-4 right-4 z-20 gap-1.5 px-3 py-1.5 text-xs"
        aria-label={t("removeAria")}
      >
        <X className="w-3.5 h-3.5" />
        {t("remove")}
      </Button>

      {/* Image and details share one column, so the details match the image's width */}
      <div className="relative z-10 mt-8 flex w-56 flex-col items-center sm:w-64 md:w-72 lg:w-80 xl:w-96">
        <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-lg bg-(--color-stamp-cream)">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.displayName}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, (max-width: 1024px) 288px, (max-width: 1280px) 320px, 384px"
            />
          )}
        </div>

        <div className="flex w-full flex-col items-center">
          <Heading
            as="h4"
            variant="item"
            className="text-(--color-stamp-chocolate) mb-2 text-center leading-tight overflow-hidden line-clamp-2 flex items-center justify-center text-xl md:text-2xl w-full max-w-full wrap-break-word"
          >
            {product.displayName}
          </Heading>

          <Span unstyled className="mb-2 text-2xl font-bold text-(--color-stamp-chocolate)">
            €{product.price.toFixed(2)}
          </Span>

          {/* Product specs list with fixed height and expand option */}
          {specs.length > 0 && (
            <ExpandableSpecsList specs={specs} />
          )}
        </div>
      </div>
    </div>
  );
}
