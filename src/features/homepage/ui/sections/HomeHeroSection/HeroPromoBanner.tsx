/**
 * HeroPromoBanner
 *
 * Promotional banner below the hero content.
 * Shows trust indicators, payment methods, and promo offers.
 */

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { TRUST_ITEMS, TRUST_ITEM_VALUES } from "@/features/homepage/lib/constants/trustItems";

export function HeroPromoBanner() {
  const t = useTranslations("home.heroTrust");

  return (
    <div className="relative z-10 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-4xl mt-12 xl:mt-16">
        {/* Trust items row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {TRUST_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-(--color-stamp-peach)">
                <item.icon aria-hidden className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-(--color-stamp-gold-text)" />
              </div>
              <div className="flex flex-col">
                <Span
                  variant="micro"
                  className="font-semibold text-(--color-stamp-chocolate) leading-tight"
                >
                  {t(`${item.id}Label`, TRUST_ITEM_VALUES)}
                </Span>
                <Span
                  variant="micro"
                  className="text-(--color-stamp-taupe) leading-tight"
                >
                  {t(`${item.id}Sublabel`, TRUST_ITEM_VALUES)}
                </Span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
