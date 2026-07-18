/**
 * TrustGuaranteesGrid
 *
 * Grid of trust guarantee cards with staggered reveal animation.
 */

"use client";

import { useTranslations } from "next-intl";
import { useStaggeredReveal } from "@/hooks/useStaggeredReveal";
import {
  HOME_TRUST_GUARANTEES,
  TRUST_GUARANTEES_STAGGER_DELAY_MS,
} from "../../../lib/constants/homepageContent";
import { TrustGuaranteeCard } from "./TrustGuaranteeCard";

export function TrustGuaranteesGrid() {
  const t = useTranslations("home.guarantees");

  const { containerRef, isItemVisible } = useStaggeredReveal({
    itemCount: HOME_TRUST_GUARANTEES.length,
    staggerDelay: TRUST_GUARANTEES_STAGGER_DELAY_MS,
    threshold: 0.2,
    rootMargin: "0px 0px -10% 0px",
  });

  return (
    <div ref={containerRef}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_TRUST_GUARANTEES.map((guarantee, index) => (
          <TrustGuaranteeCard
            key={guarantee.id}
            icon={guarantee.icon}
            title={t(`items.${guarantee.id}.title`)}
            description={t(`items.${guarantee.id}.description`)}
            isVisible={isItemVisible(index)}
          />
        ))}
      </div>
    </div>
  );
}
