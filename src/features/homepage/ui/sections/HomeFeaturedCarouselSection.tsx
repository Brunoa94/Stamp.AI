/**
 * HomeFeaturedCarouselSection
 *
 * "Featured Pieces" — horizontal scrolling carousel with larger product cards
 * and a more editorial layout. Placed after the Manifesto section.
 *
 * Fetches ALL active products (like stamp page) instead of just featured ones.
 */

"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { useCatalogProducts } from "@/queries/catalogQueries";
import { CatalogQueryService } from "@/services/catalogQueryService";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { SectionReveal } from "../components/SectionReveal";

const EXCLUDED_BLUEPRINT_IDS = new Set([12]);
const PROVIDER_COUNTRY = "NL";

interface CarouselProductData {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  href: string;
}

export function HomeFeaturedCarouselSection() {
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

  // Fetch provider pricing for each product
  const providerQueries = useQueries({
    queries: visibleProducts.map((product) => ({
      queryKey: ["catalog", "providers", product.id, PROVIDER_COUNTRY],
      queryFn: () =>
        CatalogQueryService.getProvidersForProduct(
          product.id,
          PROVIDER_COUNTRY,
        ),
      staleTime: 1000 * 60 * 10,
      enabled: !!product.id,
    })),
  });

  // Map products with pricing
  const products = useMemo<CarouselProductData[]>(
    () =>
      visibleProducts.map((product, index) => {
        const providers = providerQueries[index]?.data ?? [];
        const bestProvider = providers[0];
        const totalCents = bestProvider
          ? bestProvider.basePriceCents + bestProvider.shippingCostCents
          : 0;
        const price = product.selling_price_cents
          ? product.selling_price_cents / 100
          : totalCents > 0
            ? totalCents / 100
            : 0;

        return {
          id: product.id,
          name: product.display_title || product.name,
          price,
          imageUrl: product.base_image_url ?? "",
          href: bestProvider
            ? `/create?blueprint_id=${product.blueprint_id}&print_provider_id=${bestProvider.id}`
            : "/stamp",
        };
      }),
    [visibleProducts, providerQueries],
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
            title="Featured"
            accent="pieces"
            label="Curated Selection"
            className="mb-0"
          />

          <div className="mb-4 hidden gap-3 sm:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="h-12 w-12 border border-(--color-stamp-divider) bg-(--color-stamp-white) text-(--color-stamp-chocolate) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-gold) hover:bg-(--color-stamp-white)"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
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
                  key={product.id}
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
                            No image
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
                          Premium Collection
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
            Swipe to explore
          </Span>
          <ArrowRight className="h-3.5 w-3.5 text-(--color-stamp-taupe)" />
        </div>
      </SectionReveal>
    </section>
  );
}
