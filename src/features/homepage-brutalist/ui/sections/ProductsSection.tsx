"use client";

import Link from "next/link";
import { ProductCard } from "../components/ProductCard";
import { BrutalistSectionHeader } from "../components/BrutalistSectionHeader";
import { Button } from "@/features/ui/button";
import { useTshirtProducts } from "@/queries/productQueries";

/**
 * Products Section Component
 *
 * Features:
 * - Section header with "The Essentials" + catalog number
 * - 4-column responsive grid (1→2→4)
 * - Product cards with 3:4 aspect ratio and grayscale hover
 * - Fetches real products from database
 * - Shows loading state while fetching
 */

export function ProductsSection() {
  const { data: tshirtProducts = [], isLoading } = useTshirtProducts();

  return (
    <section id="products" className="relative py-32 px-8 bg-concrete text-ink">
      <BrutalistSectionHeader title="The Essentials" label="CATALOG_001" />

      {/* Products grid */}
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        {isLoading
          ? // Loading skeletons
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="animate-pulse">
                <div className="aspect-3/4 bg-white border-2 border-ink mb-4" />
                <div className="flex justify-between items-start mb-2">
                  <div className="h-6 bg-ink/10 rounded w-2/3" />
                  <div className="h-6 bg-ink/10 rounded w-16" />
                </div>
                <div className="h-4 bg-ink/10 rounded w-1/2" />
              </div>
            ))
          : // Real products - show first 4
            tshirtProducts
              .slice(0, 4)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  id={`product-${product.id}`}
                  name={product.name}
                  price={product.price}
                  specs={`${product.material} / ${product.fit}`.toUpperCase()}
                  label={`${product.brand}_${product.model}`
                    .replace(/\s+/g, "_")
                    .toUpperCase()}
                  imageUrl={product.image}
                  href={`/create?blueprint_id=${product.blueprint_id}&print_provider_id=${product.print_provider_id}`}
                />
              ))}
      </div>

      {/* View all link */}
      <div className="max-w-screen-2xl mx-auto mt-16 flex justify-center">
        <Button
          asChild
          variant="ghost"
          className="group h-auto rounded-none p-0 font-anton text-2xl uppercase tracking-wider hover:text-brandPurple hover:bg-transparent"
        >
          <Link href="/create">
            <span>View Full Catalog</span>
            <span className="inline-block group-hover:translate-x-2 transition-transform">
              -
            </span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
