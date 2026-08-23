/**
 * HomeProductsSection
 *
 * "The Essentials" — featured catalog grid fed by the server-side
 * product cache, with a link to the full catalog.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Span } from "@/features/ui/span";
import type { ProductCardData } from "../../lib/mappers/productCardMapper";
import { MAX_HOME_PRODUCTS } from "../../lib/constants/homepageContent";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { HomeProductCard } from "../components/HomeProductCard";
import { SectionReveal } from "../components/SectionReveal";

interface HomeProductsSectionPropsI {
  products: ProductCardData[];
}

export function HomeProductsSection({ products }: HomeProductsSectionPropsI) {
  const t = useTranslations("home.products");
  const displayedProducts = products.slice(0, MAX_HOME_PRODUCTS);

  return (
    <section id="products" className="relative overflow-x-clip px-6 py-24 lg:px-12 xl:px-24 overflow-hidden">
      {/* Decorative gold accent lines */}
      <div className="absolute top-12 left-6 lg:left-12 xl:left-24 w-28 h-1 bg-(--color-stamp-gold)/40 rounded-full" aria-hidden="true" />
      <div className="absolute top-12 right-6 lg:right-12 xl:right-24 w-28 h-1 bg-(--color-stamp-gold)/40 rounded-full" aria-hidden="true" />

      {/* Decorative corner frames */}
      <div className="absolute top-8 left-6 lg:left-12 xl:left-24 w-16 h-16 border-t-2 border-l-2 border-(--color-stamp-gold)/25 rounded-tl-lg" aria-hidden="true" />
      <div className="absolute top-8 right-6 lg:right-12 xl:right-24 w-16 h-16 border-t-2 border-r-2 border-(--color-stamp-gold)/25 rounded-tr-lg" aria-hidden="true" />

      <SectionReveal className="relative mx-auto max-w-screen-2xl" parallax fadeOnScroll>
        <HomeSectionHeader
          title={t("title")}
          accent={t("accent")}
          label={t("label")}
          className="mb-16"
        />

        {displayedProducts.length === 0 ? (
          <Span
            role="status"
            variant="default"
            className="block py-16 text-center text-(--color-stamp-taupe)"
          >
            {t("emptyState")}
          </Span>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4 lg:gap-12">
            {displayedProducts.map((product, index) => (
              <HomeProductCard key={product.blueprintId} product={product} index={index} />
            ))}
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Link
            href="/stamp"
            className="group inline-flex items-center gap-2 text-(--color-stamp-taupe) transition-colors duration-300 hover:text-(--color-stamp-gold)"
          >
            <Span variant="default">{t("viewFullCatalog")}</Span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </SectionReveal>
    </section>
  );
}
