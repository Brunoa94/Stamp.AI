"use client";

import { Heading } from "@/features/ui/heading";
import { useTranslations } from "next-intl";
import { HomeProductCard } from "../components/HomeProductCard";
import type { ProductCardData } from "../../lib/mappers/productCardMapper";

export function HomeLaunchOffersSection({ products }: { products: ProductCardData[] }) {
  const t = useTranslations("promotions");
  const offers = products.filter((product) => product.isPromotional);
  if (!offers.length) return null;
  return <section id="launch-offers" aria-labelledby="launch-offers-title" className="scroll-mt-28 bg-(--color-stamp-cream) px-6 py-16 lg:px-12 xl:px-24">
    <div className="mx-auto max-w-screen-2xl">
      <div id="launch-offers-title"><Heading unstyled as="h2" className="mb-10 font-heading text-3xl uppercase text-(--color-stamp-chocolate)">{t("title")}</Heading></div>
      <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4 lg:gap-12">
        {offers.map((product, index) => <HomeProductCard key={product.blueprintId} product={product} index={index} />)}
      </div>
    </div>
  </section>;
}
