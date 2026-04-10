import Link from "next/link";
import { SectionHeader } from "@/features/homepage/components/SectionHeader";
import type { TshirtType } from "@/types/product";
import {
  mapProductIndexToCardGradient,
  mapProductToPriceFrom,
} from "@/features/homepage/mappers/productsCardMapper";

interface ProductsSectionProps {
  isProductsLoading: boolean;
  tshirtProducts: TshirtType[];
}

export function ProductsSection({
  isProductsLoading,
  tshirtProducts,
}: ProductsSectionProps) {
  return (
    <section
      id="pricing"
      className="border-y border-slate-200 bg-linear-to-br from-[#06B6D4]/8 via-white to-[#7C3AED]/8 py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-6 ">
        <SectionHeader
          className="mb-8"
          eyebrow="03 / Products Available"
          title="Custom products ready to order."
          description="Pick your base product, customize the design, and place your order in minutes."
          titleSize="xl"
          descriptionClassName="mt-5 max-w-3xl text-lg font-medium leading-relaxed text-slate-500"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isProductsLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <article
                  key={`product-skeleton-${idx}`}
                  className="glass-card overflow-hidden rounded-xl border border-white/60 bg-white/70"
                >
                  <div className="h-36 animate-pulse bg-slate-200/80" />
                  <div className="space-y-3 p-5">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200/80" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200/70" />
                    <div className="h-3 w-3/5 animate-pulse rounded bg-slate-200/70" />
                    <div className="h-8 w-32 animate-pulse rounded bg-slate-200/80" />
                  </div>
                </article>
              ))
            : tshirtProducts.slice(0, 3).map((product, idx) => {
                const cardGradient = mapProductIndexToCardGradient(idx);
                const priceFrom = mapProductToPriceFrom(product);

                return (
                  <article
                    key={product.id}
                    className={`glass-card relative overflow-hidden rounded-xl border border-slate-200 bg-linear-to-br ${cardGradient} transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}
                  >
                    <div className="relative h-36 w-full overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900/35 via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-700">
                        {product.brand}
                      </span>
                    </div>

                    <div className="space-y-3 p-5">
                      <h3 className="font-heading text-xl uppercase text-slate-900">
                        {product.name}
                      </h3>

                      <div className="space-y-2 text-[11px] text-slate-500">
                        <p>
                          <span className="font-bold uppercase tracking-wider text-slate-700">
                            Materials:{" "}
                          </span>
                          {product.material}
                        </p>
                        <p>
                          <span className="font-bold uppercase tracking-wider text-slate-700">
                            Model:{" "}
                          </span>
                          {product.model}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-2">
                        <span className="font-heading text-2xl uppercase text-slate-900">
                          From €{Math.round(priceFrom)}
                        </span>
                        <Link
                          href="/stamp"
                          className="rounded-lg bg-linear-to-r from-[#7C3AED] to-[#06B6D4] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:shadow-lg hover:shadow-purple-500/30"
                        >
                          Order now
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>
        {!isProductsLoading && tshirtProducts.length === 0 && (
          <p className="mt-10 text-center text-sm text-slate-500">
            No custom products available right now. Please check again shortly.
          </p>
        )}
      </div>
    </section>
  );
}
