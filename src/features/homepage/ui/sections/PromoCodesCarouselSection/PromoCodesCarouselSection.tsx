"use client";

import clsx from "clsx";
import { useMemo, type CSSProperties } from "react";
import { useAvailablePromoCodes } from "@/queries/promocodeQueries";
import {
  FALLBACK_PROMO_CODES,
  PROMO_CAROUSEL_ANIMATION_DURATION_MS,
} from "./constants";
import { usePromoCarouselOverflow } from "./hooks/usePromoCarouselOverflow";
import { PromoCodeCard } from "./components/PromoCodeCard";
import { PromoCodesSectionHeader } from "./components/PromoCodesSectionHeader";
import { PromoCodesSkeletonList } from "./components/PromoCodesSkeletonList";

const SKELETON_ITEMS_COUNT = 6;
const promoCarouselStyle = {
  "--promo-carousel-duration": `${PROMO_CAROUSEL_ANIMATION_DURATION_MS}ms`,
} as CSSProperties;

export function PromoCodesCarouselSection() {
  const { data: promoCodes = [], isLoading } = useAvailablePromoCodes();

  const sourceCodes = promoCodes.length > 0 ? promoCodes : FALLBACK_PROMO_CODES;

  const dependencyKey = useMemo(
    () =>
      sourceCodes
        .map((promo) => `${promo.promocode_id}-${promo.code}`)
        .join("|"),
    [sourceCodes],
  );

  const { viewportRef, trackRef, shouldAnimate } = usePromoCarouselOverflow(
    isLoading,
    dependencyKey,
  );

  const carouselItems = useMemo(
    () => (shouldAnimate ? [...sourceCodes, ...sourceCodes] : sourceCodes),
    [shouldAnimate, sourceCodes],
  );

  return (
    <section
      id="promocodes"
      className="relative overflow-hidden bg-transparent py-24"
    >
      <div
        className="pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full bg-[#7C3AED]/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-4 h-80 w-80 rounded-full bg-[#06B6D4]/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-6xl px-6 ">
        <PromoCodesSectionHeader />
      </div>

      <div
        className="promo-carousel-group relative overflow-hidden border-y border-none py-4 backdrop-blur-xl md:px-3"
        style={promoCarouselStyle}
      >
        <div ref={viewportRef} className="w-full overflow-hidden">
          <div
            ref={trackRef}
            className={clsx(
              "promo-carousel-track flex min-w-max items-stretch gap-5 px-6 md:px-10",
              {
                "promo-carousel-track--animated": shouldAnimate,
                "w-full justify-center": !shouldAnimate,
              },
            )}
          >
            {isLoading ? (
              <PromoCodesSkeletonList count={SKELETON_ITEMS_COUNT} />
            ) : (
              carouselItems.map((promo, idx) => (
                <PromoCodeCard
                  key={`${promo.promocode_id}-${idx}`}
                  promo={promo}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
