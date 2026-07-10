/**
 * HomeProductsSection
 *
 * "The Essentials" — featured catalog grid fed by the server-side
 * product cache, with a link to the full catalog.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Span } from "@/features/ui/span";
import type { ProductCardData } from "@/features/homepage-brutalist/lib/mappers/productCardMapper";
import { MAX_HOME_PRODUCTS } from "../../lib/constants/homepageContent";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { HomeProductCard } from "../components/HomeProductCard";

interface HomeProductsSectionPropsI {
  products: ProductCardData[];
}

export function HomeProductsSection({ products }: HomeProductsSectionPropsI) {
  const displayedProducts = products.slice(0, MAX_HOME_PRODUCTS);

  return (
    <section id="products" className="px-6 py-24 lg:px-12 xl:px-24">
      <div className="mx-auto max-w-screen-2xl">
        <HomeSectionHeader
          title="The"
          accent="essentials"
          label="Catalog 001"
        />

        {displayedProducts.length === 0 ? (
          <Span
            role="status"
            variant="default"
            className="block py-16 text-center text-(--color-stamp-taupe)"
          >
            The catalog is temporarily unavailable — please check back soon
          </Span>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {displayedProducts.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Link
            href="/stamp"
            className="group inline-flex items-center gap-2 text-(--color-stamp-taupe) transition-colors duration-300 hover:text-(--color-stamp-gold)"
          >
            <Span variant="default">View Full Catalog</Span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
