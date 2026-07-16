/**
 * HomeFeaturedCarouselSection
 *
 * "Featured Pieces" — horizontal scrolling carousel with larger product cards
 * and a more editorial layout. Placed after the Manifesto section.
 *
 * Fetches ALL active products (like stamp page) instead of just featured ones.
 * Simplified: uses embedded pricing from product_variants (Printify Choice)
 */

"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { useCatalogProducts } from "@/queries/catalogQueries";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { SectionReveal } from "../components/SectionReveal";

const EXCLUDED_BLUEPRINT_IDS = new Set([12]);

interface CarouselProductData {
  blueprintId: number;
  name: string;
  price: number;
  imageUrl: string;
  href: string;
}

export function HomeFeaturedCarouselSection() {
  const t = useTranslations("home.featured");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch all active products (same as stamp page)
  const { data: rawProducts = [], isLoading } = useCatalogProducts();

  const visibleProducts = useMemo(
    () =>
      rawProducts.filter(
        (product) => !EXCLUDED_BLUEPRINT_IDS.has(product.blueprint_id),
      ),
    [rawProducts],
  );

  // Map products with pricing
  const products = useMemo<CarouselProductData[]>(
    () =>
      visibleProducts.map((product) => {
        // New flow: price comes from the product's precomputed
        // min_price_cents (cheapest available Printify Choice variant)
        // plus shipping, unless an admin selling-price override is set.
        const baseCents = product.min_price_cents || 0;
        const shippingCents = product.shipping_cents || 0;
        const totalCents =
          product.selling_price_cents ??
          (baseCents > 0 ? baseCents + shippingCents : 0);
        const price = totalCents > 0 ? totalCents / 100 : 0;

        return {
          blueprintId: product.blueprint_id,
          name: product.display_title,
          price,
          imageUrl: product.base_image_url ?? "",
          href: "/stamp",
        };
      }),
    [visibleProducts],
  );

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.clientWidth ?? 400;
    const scrollAmount = cardWidth + 32; // card width + gap
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Don't render section if no products after loading
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="bg-(--color-stamp-cream) px-6 py-24 lg:px-12 xl:px-24">
      <SectionReveal className="mx-auto max-w-screen-2xl">
        <div className="flex items-end justify-between">
          <HomeSectionHeader
            title={t("title")}
            accent={t("accent")}
            label={t("label")}
            className="mb-0"
          />

          <div className="mb-4 hidden gap-3 sm:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("left")}
              aria-label={t("scrollLeft")}
              className="h-12 w-12 border border-(--color-stamp-divider) bg-(--color-stamp-white) text-(--color-stamp-chocolate) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-gold) hover:bg-(--color-stamp-white)"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("right")}
              aria-label={t("scrollRight")}
              className="h-12 w-12 border border-(--color-stamp-divider) bg-(--color-stamp-white) text-(--color-stamp-chocolate) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-gold) hover:bg-(--color-stamp-white)"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="scrollbar-hide mt-12 flex gap-5 overflow-x-auto pb-4"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-72 shrink-0 border-2 border-(--color-stamp-divider) bg-linear-to-br from-(--color-stamp-cream) to-(--color-stamp-off-white) p-3 sm:w-80"
                >
                  <div className="aspect-3/4 animate-pulse bg-(--color-stamp-divider)" />
                  <div className="mt-3 space-y-2 border-t border-(--color-stamp-divider)/50 pt-3">
                    <div className="h-4 w-3/4 animate-pulse bg-(--color-stamp-divider)" />
                    <div className="h-3 w-1/2 animate-pulse bg-(--color-stamp-divider)" />
                  </div>
                </div>
              ))
            : products.map((product, index) => (
                <Link
                  key={product.blueprintId}
                  href={product.href}
                  className="group block w-72 shrink-0 sm:w-80"
                >
                  {/* Vintage card frame */}
                  <div className="relative border-2 border-(--color-stamp-divider) bg-linear-to-br from-(--color-stamp-cream) to-(--color-stamp-off-white) p-3 shadow-[inset_0_0_0_1px_var(--color-stamp-taupe)/20,0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover:-translate-y-1">
                    {/* Inner frame border */}
                    <div className="pointer-events-none absolute inset-2 border border-(--color-stamp-taupe)/30" />

                    {/* Image container */}
                    <div className="relative aspect-3/4 overflow-hidden bg-(--color-stamp-white)">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 288px, 320px"
                          className="object-cover sepia-[0.1] transition-all duration-700 group-hover:scale-105 group-hover:sepia-0"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-(--color-stamp-cream)">
                          <Span
                            variant="micro"
                            className="text-(--color-stamp-taupe)"
                          >
                            {t("noImage")}
                          </Span>
                        </div>
                      )}

                      {/* Index badge - vintage style */}
                      <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center border border-(--color-stamp-taupe) bg-linear-to-br from-(--color-stamp-cream) to-(--color-stamp-off-white) shadow-sm backdrop-blur-sm">
                        <Span
                          variant="micro"
                          className="text-(--color-stamp-taupe)"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </Span>
                      </div>
                    </div>

                    {/* Product info - inside the frame */}
                    <div className="mt-3 flex items-start justify-between gap-3 border-t border-(--color-stamp-divider)/50 pt-3">
                      <div className="min-w-0 flex-1">
                        <Heading
                          as="h3"
                          variant="item"
                          className="truncate text-(--color-stamp-chocolate) transition-colors duration-300 group-hover:text-(--color-stamp-gold)"
                        >
                          {product.name}
                        </Heading>
                        <Span
                          as="p"
                          variant="micro"
                          className="mt-0.5 text-(--color-stamp-taupe)"
                        >
                          {t("collectionLabel")}
                        </Span>
                      </div>
                      {product.price > 0 && (
                        <Span
                          variant="micro"
                          className="font-medium text-(--color-stamp-chocolate)"
                        >
                          €{product.price.toFixed(2)}
                        </Span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {/* Mobile scroll hint */}
        <div className="mt-6 flex items-center justify-center gap-2 sm:hidden">
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {t("swipeHint")}
          </Span>
          <ArrowRight className="h-3.5 w-3.5 text-(--color-stamp-taupe)" />
        </div>
      </SectionReveal>
    </section>
  );
}
