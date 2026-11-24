/**
 * HomeProductsSection
 *
 * "The essentials": a listing grid of the catalog's featured products, fed
 * by the server-side product cache, with a "browse all" pill. Each card
 * previews where the design prints on hover.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";
import type { ProductCardData } from "../../../lib/mappers/productCardMapper";
import { MAX_HOME_PRODUCTS } from "../../../lib/constants/homepageContent";
import { productCardTint } from "../../../lib/helpers/productCardTint";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";
import { HomeProductCard } from "./HomeProductCard";

interface PropsI {
  products: ProductCardData[];
}

export function HomeProductsSection({ products }: PropsI) {
  const t = useTranslations("home.products");
  const displayedProducts = products.slice(0, MAX_HOME_PRODUCTS);

  return (
    <section
      id="products"
      aria-labelledby="home-products-title"
      className="scroll-mt-28 bg-(--color-stamp-cream) px-4 py-20 sm:px-6 lg:px-12"
    >
      <div className="mx-auto max-w-screen-2xl">
        <HomeSectionHeader
          id="home-products-title"
          label={t("label")}
          title={t("title")}
          accent={t("accent")}
          subtitle={t("subtitle")}
          action={
            <Link
              href="/catalog"
              className="group inline-flex h-11 items-center gap-2 self-start rounded-full bg-(--color-stamp-chocolate) px-5 text-sm font-semibold text-(--color-stamp-white) transition-colors hover:bg-(--color-stamp-chocolate)/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate) sm:self-auto"
            >
              {t("viewFullCatalog")}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
            </Link>
          }
          className="mb-10"
        />

        {displayedProducts.length === 0 ? (
          <Span
            role="status"
            variant="default"
            className="block rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) py-16 text-center text-(--color-stamp-taupe)"
          >
            {t("emptyState")}
          </Span>
        ) : (
          <List className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {displayedProducts.map((product, index) => (
              <li key={product.blueprintId}>
                <HomeProductCard product={product} tint={productCardTint(index)} />
              </li>
            ))}
          </List>
        )}
      </div>
    </section>
  );
}
