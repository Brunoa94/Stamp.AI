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

import { useRef, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useCatalogProductsWithSeo } from "@/queries/catalogQueries";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { SectionReveal } from "../components/SectionReveal";
import { FeaturedCarouselCard } from "../components/FeaturedCarousel/FeaturedCarouselCard";
import { FeaturedCarouselHint } from "../components/FeaturedCarousel/FeaturedCarouselHint";
import { FeaturedCarouselNav } from "../components/FeaturedCarousel/FeaturedCarouselNav";
import { FeaturedCarouselSkeleton } from "../components/FeaturedCarousel/FeaturedCarouselSkeleton";
import {
  filterCarouselProducts,
  mapToCarouselProducts,
} from "../../lib/helpers/carouselProducts";

const CARD_GAP_PX = 32;

export function HomeFeaturedCarouselSection() {
  const t = useTranslations("home.featured");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: rawProducts = [], isLoading } = useCatalogProductsWithSeo();

  const products = useMemo(() => {
    const filtered = filterCarouselProducts(rawProducts);
    return mapToCarouselProducts(filtered);
  }, [rawProducts]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.clientWidth ?? 400;
    const scrollAmount = cardWidth + CARD_GAP_PX;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleScrollLeft = useCallback(() => scroll("left"), [scroll]);
  const handleScrollRight = useCallback(() => scroll("right"), [scroll]);

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="bg-(--color-stamp-cream) px-6 py-24 lg:px-12 xl:px-24">
      <SectionReveal className="mx-auto max-w-screen-2xl" parallax fadeOnScroll>
        <div className="flex items-end justify-between">
          <HomeSectionHeader
            title={t("title")}
            accent={t("accent")}
            label={t("label")}
            className="mb-0"
          />
          <FeaturedCarouselNav
            onScrollLeft={handleScrollLeft}
            onScrollRight={handleScrollRight}
          />
        </div>

        <div
          ref={scrollRef}
          className="scrollbar-hide mt-12 flex gap-5 overflow-x-auto pb-4"
        >
          {isLoading ? (
            <FeaturedCarouselSkeleton />
          ) : (
            products.map((product, index) => (
              <FeaturedCarouselCard
                key={product.blueprintId}
                product={product}
                index={index}
              />
            ))
          )}
        </div>

        <FeaturedCarouselHint />
      </SectionReveal>
    </section>
  );
}
