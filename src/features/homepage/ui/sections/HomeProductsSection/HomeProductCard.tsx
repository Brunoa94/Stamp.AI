/**
 * HomeProductCard
 *
 * "Print area preview" listing card: a tinted rounded card with a tall photo,
 * an amber sale badge, the name and price on one line and the colours it
 * comes in. On hover or focus the card lifts, a dashed "your design" box
 * shows where the print goes on the product, and a "Design yours" bar slides
 * up from the bottom of the photo.
 */

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { ColorSwatches } from "../../components/ColorSwatches";
import type { ProductCardData } from "../../../lib/mappers/productCardMapper";
import type { HomeProductCardTintT } from "../../../lib/types/productCardTint";
import { homeProductCardVariants } from "../../../lib/variants/homeProductCardVariants";

interface PropsI {
  product: ProductCardData;
  tint: HomeProductCardTintT;
}

export function HomeProductCard({ product, tint }: PropsI) {
  const t = useTranslations("home.productCard");
  const { printArea } = product;

  return (
    <Link
      href={product.href}
      className={cn(
        homeProductCardVariants({ tint }),
        "group flex h-full flex-col gap-3.5 rounded-3xl p-3 shadow-(--shadow-stamp-card) transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg focus-visible:-translate-y-1.5 focus-visible:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate) motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0",
      )}
    >
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-(--color-stamp-sage)">
        {product.imageUrl ? (
          <>
            <Image
              src={product.imageUrl}
              alt={product.displayName}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute flex scale-90 items-center justify-center rounded-md border-2 border-dashed border-(--color-stamp-gold-text) bg-(--color-stamp-gold)/10 opacity-0 transition-[opacity,scale] duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
              style={{
                left: `${printArea.left}%`,
                top: `${printArea.top}%`,
                width: `${printArea.width}%`,
                height: `${printArea.height}%`,
              }}
            >
              <Span
                unstyled
                className="rounded-full bg-(--color-stamp-gold-text) px-2.5 py-1 text-2xs font-semibold whitespace-nowrap text-(--color-stamp-white)"
              >
                {t("printArea")}
              </Span>
            </div>
          </>
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
            className="absolute top-2.5 left-2.5 rounded-full bg-(--color-stamp-gold) px-2.5 py-1 text-(--color-stamp-chocolate)"
          >
            {t("discountBadge", { percent: product.discountPercent ?? 0 })}
          </Span>
        )}

        <Span
          unstyled
          aria-hidden
          className="absolute inset-x-2 bottom-2 hidden h-12 translate-y-16 items-center justify-between gap-2 rounded-xl bg-(--color-stamp-white)/90 pr-1.5 pl-4 text-sm font-semibold text-(--color-stamp-chocolate) backdrop-blur-md transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none md:flex"
        >
          {t("customize")}
          <Span
            unstyled
            className="flex size-9 items-center justify-center rounded-lg bg-(--color-stamp-chocolate) text-(--color-stamp-white)"
          >
            <ArrowRight className="size-4" />
          </Span>
        </Span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-1 pb-1">
        <div className="flex items-start justify-between gap-3">
          <Heading
            as="h3"
            variant="itemCompact"
            className="line-clamp-2 text-base text-(--color-stamp-chocolate) md:text-base"
          >
            {product.displayName}
          </Heading>

          <div className="flex shrink-0 flex-col items-end">
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
        </div>

        {product.availableColors.length > 0 && (
          <div className="mt-auto">
            <ColorSwatches colors={product.availableColors} labels={product.colorLabels} maxDisplay={5} />
          </div>
        )}
      </div>
    </Link>
  );
}
