/**
 * HomeProductOfMonthSection
 *
 * "Pick of the month" spotlight: a chocolate split panel with the product
 * photos crossfading full-bleed on one half (blank, then customized), and
 * its name, description, then the price and CTA under a hairline on the
 * other. Renders nothing until a product of the month is set.
 */

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { useLocalizedProductOfMonth } from "@/features/homepage/lib/hooks/useLocalizedProductOfMonth";
import { getCustomizedShots } from "@/features/homepage/lib/helpers/productOfMonthShots";
import { ProductOfMonthShowcase } from "./ProductOfMonthShowcase";

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
      <div className="mx-auto grid max-w-screen-2xl overflow-hidden rounded-2xl border-2 border-(--color-stamp-gold) bg-(--color-stamp-chocolate) md:grid-cols-2">
        <ProductOfMonthShowcase
          blankSrc={product.base_image_url}
          name={displayName}
          shots={getCustomizedShots(product.blueprint_id)}
        />

        <div className="flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-16">
          <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
          <Span as="p" variant="label" className="text-(--color-stamp-gold-light)">
            {t("eyebrow")}
          </Span>
          <Heading as="h2" id="home-pick-title" variant="panelTitle" className="text-(--color-stamp-off-white)">
            {displayName}
          </Heading>
          {description && (
            <Paragraph variant="xs" className="line-clamp-4 max-w-xl text-(--color-stamp-taupe-light) md:text-lg">
              {description}
            </Paragraph>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-6 border-t border-(--color-stamp-off-white)/15 pt-8">
            <div className="flex items-baseline gap-3">
              <Span unstyled className="text-4xl font-bold text-(--color-stamp-off-white)">
                €{price.toFixed(2)}
              </Span>
              {originalPrice && (
                <Span variant="sm" className="font-normal text-(--color-stamp-taupe-light) line-through">
                  €{originalPrice.toFixed(2)}
                </Span>
              )}
            </div>
            <Button asChild variant="cta-gold" className="group">
              <Link href="/stamp">
                {t("cta")}
                <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
