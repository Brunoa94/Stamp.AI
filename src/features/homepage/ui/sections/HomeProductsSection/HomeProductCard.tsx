/**
 * HomeProductCard
 *
 * Listing card in the shared "stamp frame": a white rounded card with a
 * square photo, an amber sale badge, the product name, the price (with the
 * old price when on sale) and the colours it comes in. Lifts into the offset
 * stamp shadow on hover.
 */

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { ColorSwatches } from "../../components/ColorSwatches";
import type { ProductCardData } from "../../../lib/mappers/productCardMapper";

interface PropsI {
  product: ProductCardData;
}

export function HomeProductCard({ product }: PropsI) {
  const t = useTranslations("home.productCard");

  return (
    <Link
      href={product.href}
      className="group flex h-full flex-col rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-2 pb-4 shadow-(--shadow-stamp-card) transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate)/30 hover:shadow-(--shadow-stamp-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)"
    >
      <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-(--color-stamp-cream)">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.displayName}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              {t("noImage")}
            </Span>
          </div>
        )}

        {(product.discountPercent ?? 0) > 0 && (
          <Span
            variant="badge"
            className="absolute top-2 left-2 rounded-md bg-(--color-stamp-gold) px-2 py-1 text-(--color-stamp-chocolate)"
          >
            {t("discountBadge", { percent: product.discountPercent ?? 0 })}
          </Span>
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

        <div className="flex items-baseline gap-2">
          <Span
            unstyled
            className={cn(
              "text-lg font-bold",
              product.isOnSale ? "text-(--color-stamp-gold-text)" : "text-(--color-stamp-chocolate)",
            )}
          >
            €{product.price.toFixed(2)}
          </Span>
          {product.isOnSale && product.originalPrice && (
            <Span variant="micro" className="text-(--color-stamp-taupe) line-through">
              €{product.originalPrice.toFixed(2)}
            </Span>
          )}
        </div>

        {product.availableColors.length > 0 && (
          <div className="mt-auto pt-2">
            <ColorSwatches colors={product.availableColors} labels={product.colorLabels} maxDisplay={5} />
          </div>
        )}
      </div>
    </Link>
  );
}
