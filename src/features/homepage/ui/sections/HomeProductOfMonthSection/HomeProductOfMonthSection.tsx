/**
 * HomeProductOfMonthSection
 *
 * "Pick of the month" spotlight: a rounded cream panel with the product
 * photo on one side and its name, description, price and a pill CTA on the
 * other. Renders nothing until a product of the month is set.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Medal } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { useLocalizedProductOfMonth } from "@/features/homepage/lib/hooks/useLocalizedProductOfMonth";

export function HomeProductOfMonthSection() {
  const t = useTranslations("home.productOfMonth");
  const { product, isLoading, text } = useLocalizedProductOfMonth();

  // Don't render if no product of the month is set or still loading
  if (isLoading || !product || !text) {
    return null;
  }

  const { displayName, description } = text;

  const price = product.selling_price_cents
    ? product.selling_price_cents / 100
    : (product.min_price_cents + product.shipping_cents) / 100;

  const originalPrice =
    product.is_on_sale && product.original_price_cents
      ? product.original_price_cents / 100
      : null;

  return (
    <section aria-labelledby="home-pick-title" className="px-4 py-20 sm:px-6 lg:px-12">
      <div className="mx-auto grid max-w-screen-2xl items-center gap-8 overflow-hidden rounded-2xl bg-(--color-stamp-peach) p-6 sm:p-10 md:grid-cols-5 lg:gap-16 lg:p-14">
        <div className="relative aspect-square overflow-hidden rounded-xl border-4 border-(--color-stamp-white) bg-(--color-stamp-white) shadow-(--shadow-stamp-card-hover) md:col-span-2">
          {product.base_image_url ? (
            <Image
              src={product.base_image_url}
              alt={displayName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1536px) 38vw, 560px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Span variant="micro" className="text-(--color-stamp-taupe)">
                {t("noImage")}
              </Span>
            </div>
          )}
          <Span
            variant="default"
            className="absolute top-3 left-3 flex items-center gap-2 rounded-md bg-(--color-stamp-gold) px-3 py-1.5 text-(--color-stamp-chocolate) shadow-(--shadow-stamp-card)"
          >
            <Medal className="size-4" aria-hidden />
            {t("badge")}
          </Span>
        </div>

        <div className="flex flex-col items-start gap-5 md:col-span-3">
          <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
          <Span as="p" variant="label" className="text-(--color-stamp-gold-text)">
            {t("eyebrow")}
          </Span>
          <Heading as="h2" id="home-pick-title" variant="sectionDisplay" className="text-(--color-stamp-chocolate)">
            {displayName}
          </Heading>
          {description && (
            <Paragraph variant="xs" className="line-clamp-4 max-w-xl text-(--color-stamp-taupe) md:text-lg">
              {description}
            </Paragraph>
          )}
          <div className="flex items-baseline gap-3">
            <Span unstyled className="text-3xl font-bold text-(--color-stamp-chocolate)">
              €{price.toFixed(2)}
            </Span>
            {originalPrice && (
              <Span variant="sm" className="font-normal text-(--color-stamp-taupe) line-through">
                €{originalPrice.toFixed(2)}
              </Span>
            )}
          </div>
          <Button asChild variant="primary" className="group">
            <Link href="/stamp">
              {t("cta")}
              <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
