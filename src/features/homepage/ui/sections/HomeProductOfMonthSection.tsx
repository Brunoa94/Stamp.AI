/**
 * HomeProductOfMonthSection
 *
 * Horizontal two-column layout featuring the Product of the Month.
 * Left column: product image with gold medal badge.
 * Right column: title, product name, price badge, and CTA button.
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
import { useProductOfMonth } from "@/queries/catalogQueries";
import { resolveProductDescription } from "@/lib/seo/productDescription";
import { SectionReveal } from "../components/SectionReveal";

export function HomeProductOfMonthSection() {
  const t = useTranslations("home.productOfMonth");
  const { data: product, isLoading } = useProductOfMonth();

  // Don't render if no product of the month is set or still loading
  if (isLoading || !product) {
    return null;
  }

  const description = resolveProductDescription(product.product_seo);

  const price = product.selling_price_cents
    ? product.selling_price_cents / 100
    : (product.min_price_cents + product.shipping_cents) / 100;

  const originalPrice = product.is_on_sale && product.original_price_cents
    ? product.original_price_cents / 100
    : null;

  return (
    <section className="bg-(--color-stamp-chocolate) px-6 py-20 lg:px-12 xl:px-24">
      <SectionReveal className="mx-auto max-w-6xl" fadeOnScroll>
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-16">
          {/* Left Column - Product Image */}
          <div className="relative w-full max-w-sm shrink-0 md:w-80 lg:w-96">
            <div className="relative aspect-square overflow-hidden border border-(--color-stamp-gold)/30 bg-(--color-stamp-white)">
              {product.base_image_url ? (
                <Image
                  src={product.base_image_url}
                  alt={product.display_title}
                  fill
                  sizes="(max-width: 768px) 320px, 384px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-(--color-stamp-cream)">
                  <Span variant="micro" className="text-(--color-stamp-taupe)">
                    {t("noImage")}
                  </Span>
                </div>
              )}
            </div>

            {/* Gold Medal Badge - Top Left */}
            <div className="absolute -left-4 -top-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--color-stamp-gold) shadow-lg sm:-left-5 sm:-top-5 sm:h-20 sm:w-20">
              <Medal className="h-8 w-8 text-(--color-stamp-chocolate) sm:h-10 sm:w-10" />
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-1 w-10 bg-(--color-stamp-gold)" />
              <Span
                variant="micro"
                className="uppercase tracking-widest text-(--color-stamp-gold)"
              >
                {t("eyebrow")}
              </Span>
            </div>

            <Heading
              as="h2"
              variant="section"
              className="mb-4 text-3xl text-(--color-stamp-off-white) sm:text-4xl md:text-5xl"
            >
              {t("title")}
            </Heading>

            <Heading
              as="h3"
              variant="card"
              className="mb-6 text-xl text-(--color-stamp-off-white) sm:text-2xl"
            >
              {product.display_title}
            </Heading>

            {description && (
              <Paragraph
                variant="sm"
                className="mb-6 line-clamp-3 max-w-xl text-(--color-stamp-taupe)"
              >
                {description}
              </Paragraph>
            )}

            <div className="mb-8 inline-flex items-baseline gap-3 border border-(--color-stamp-gold)/40 bg-(--color-stamp-gold)/10 px-6 py-3">
              <Span variant="default" className="text-3xl font-medium text-(--color-stamp-gold)">
                €{price.toFixed(2)}
              </Span>
              {originalPrice && (
                <Span variant="sm" className="text-(--color-stamp-taupe) line-through">
                  €{originalPrice.toFixed(2)}
                </Span>
              )}
            </div>

            <Button asChild variant="cta-gold" className="group">
              <Link href="/stamp">
                {t("cta")}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </Button>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
