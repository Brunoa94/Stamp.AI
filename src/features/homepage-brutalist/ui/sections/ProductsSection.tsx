import Link from "next/link";
import { ProductCard } from "../components/ProductCard";
import { BrutalistSectionHeader } from "../components/BrutalistSectionHeader";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type { ProductWithPricing } from "@/lib/supabase/server-cache";
import { mapProductsToCards } from "../../lib/mappers/productCardMapper";

const MAX_HOME_PRODUCTS = 8;

/**
 * Products Section Component - Server Component
 *
 * Features:
 * - Section header with "The Essentials" + catalog number
 * - 4-column responsive grid (1→2→4)
 * - Product cards with 3:4 aspect ratio and grayscale hover
 * - Server-rendered with cached data
 * - No loading state needed (data arrives from server)
 */

interface ProductsSectionProps {
  productsWithPricing: ProductWithPricing[];
}

export function ProductsSection({ productsWithPricing }: ProductsSectionProps) {
  // Prepare product cards from featured products
  const productCards = mapProductsToCards(
    productsWithPricing.slice(0, MAX_HOME_PRODUCTS),
  );

  return (
    <section id="products" className="relative py-32 px-8 bg-concrete text-ink">
      <BrutalistSectionHeader title="The Essentials" label="CATALOG_001" />

      {/* Products grid */}
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        {productCards.map((product) => (
          <ProductCard
            key={product.id}
            id={`product-${product.id}`}
            name={product.name}
            price={product.price}
            originalPrice={product.originalPrice}
            isOnSale={product.isOnSale}
            specs={product.specs}
            imageUrl={product.imageUrl}
            href={product.href}
            availabilityStatus={product.availabilityStatus}
            availableColors={product.availableColors}
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
          <Link href="/stamp">
            <Span>View Full Catalog</Span>
            <Span className="inline-block group-hover:translate-x-2 transition-transform">
              -
            </Span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
