
import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { List } from "@/features/ui/list";
import { extractProductSpecs } from "@/lib/seo/productDescription";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";

/**
 * SelectedProductCard
 *
 * Displays the currently selected product in expanded view.
 * Allows user to clear the selection.
 */

const COLLAPSED_HEIGHT = 90;

function ExpandableSpecsList({ specs }: { specs: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full max-w-xs mt-4 pt-4 border-t border-(--color-stamp-divider)">
      <div
        className="relative overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isExpanded ? `${specs.length * 32}px` : `${COLLAPSED_HEIGHT}px` }}
      >
        <List className="text-left w-full space-y-1.5">
          {specs.map((spec, index) => (
            <li key={index}>
              <Span
                variant="micro"
                unstyled
                className="font-heading text-[13px] font-normal normal-case tracking-normal leading-relaxed text-(--color-stamp-taupe)"
              >
                {spec}
              </Span>
            </li>
          ))}
        </List>
        {!isExpanded && specs.length > 3 && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-(--color-stamp-gold)/5 to-transparent pointer-events-none" />
        )}
      </div>
      {specs.length > 3 && (
        <Button
          variant="stamp-expand"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2"
        >
          {isExpanded ? (
            <>
              See less
              <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              See more
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}

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

        {/* Product specs list with fixed height and expand option */}
        {specs.length > 0 && (
          <ExpandableSpecsList specs={specs} />
        )}
      </div>
    </div>
  );
}
