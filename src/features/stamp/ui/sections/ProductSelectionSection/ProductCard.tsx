
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { stampSelectableCardVariants } from "../../../lib/variants/stampStudioVariants";
import type { CatalogProductMappedT } from "../../../lib/types/stampTypes";

/**
 * ProductCard
 *
 * One product in the studio's product grid, in the shared card pattern: a
 * white rounded card with the photo on cream, the name and the price. Lifts
 * on hover; selected shows the amber border and a check.
 */

interface PropsI {
  product: CatalogProductMappedT;
  isSelected: boolean;
  onSelect: (product: CatalogProductMappedT) => void;
}

export function ProductCard({ product, isSelected, onSelect }: PropsI) {
  const t = useTranslations("stamp.productSelection");

  return (
    <Button
      variant="unstyled"
      onClick={() => onSelect(product)}
      className={cn(
        stampSelectableCardVariants({ selected: isSelected }),
        "group flex h-full w-full flex-col items-stretch p-2 pb-4 text-left whitespace-normal",
      )}
      aria-pressed={isSelected}
      aria-label={t("selectAria", { name: product.displayName })}
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-(--color-stamp-cream)">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.displayName}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {isSelected && (
          <div className="absolute top-2 right-2 z-10">
            <CheckCircle className="h-6 w-6 text-(--color-stamp-gold-text)" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-2">
        <Heading
          as="h3"
          variant="itemCompact"
          className="line-clamp-2 text-base text-(--color-stamp-chocolate) group-hover:text-(--color-stamp-gold-text) md:text-base"
        >
          {product.displayName}
        </Heading>

        <Span unstyled className="text-base font-bold text-(--color-stamp-chocolate)">
          €{product.price.toFixed(2)}
        </Span>
      </div>
    </Button>
  );
}
