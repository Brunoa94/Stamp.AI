"use client";

/**
 * HeroContent
 *
 * The cream start card on the stamp wall: the headline with a rotating
 * handwritten product word, the tagline, the two ways into the creator (a
 * photo or an idea), the free-credits line and, while real social proof is
 * enabled (TRUST_SOCIAL_PROOF_ENABLED), the trust row. Dark ink on cream, so
 * it reads over the busy wall without a text shadow.
 */

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { HeroAnimatedTitle } from "./HeroAnimatedTitle";
import { HeroRotatingWord } from "./HeroRotatingWord";
import { HeroStartOptions } from "./HeroStartOptions";
import { OrdersFulfilledCounter } from "@/features/ui/trust/OrdersFulfilledCounter";
import { TrustpilotWidget } from "@/features/ui/trust/TrustpilotWidget";
import {
  TRUST_ORDER_METRICS,
  TRUST_SOCIAL_PROOF_ENABLED,
} from "@/shared/constants/trustMetrics";

export function HeroContent() {
  const t = useTranslations("home.hero");

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-(--color-stamp-cream) p-6 text-left shadow-(--shadow-stamp-card-hover) sm:gap-6 sm:p-8 2xl:p-10">
      <HeroAnimatedTitle>
        <Heading
          as="h1"
          variant="title"
          className="text-5xl leading-[0.95] text-(--color-stamp-chocolate) sm:text-6xl xl:text-5xl 2xl:text-6xl"
        >
          {t.rich("headline", {
            br: () => <br />,
            word: () => <HeroRotatingWord />,
          })}
        </Heading>
      </HeroAnimatedTitle>

      <Paragraph variant="xs" className="max-w-lg text-lg text-(--color-stamp-taupe)">
        {t("tagline")}
      </Paragraph>

      <HeroStartOptions />

      {/* Free credits highlight */}
      <Span as="p" variant="serif" className="text-2xl text-(--color-stamp-chocolate)">
        {t.rich("freeCredits", {
          signUp: (chunks) => (
            <Button
              variant="link"
              className="inline h-auto p-0 font-serif text-2xl font-bold lowercase italic text-(--color-stamp-gold-text) hover:text-(--color-stamp-chocolate)!"
              onClick={() => {
                document.dispatchEvent(new CustomEvent("open-auth-modal"));
              }}
            >
              {chunks}
            </Button>
          ),
        })}
      </Span>

      {/* Trust signals - above fold, real social proof only */}
      {TRUST_SOCIAL_PROOF_ENABLED && (
        <div className="flex flex-wrap items-center gap-2 empty:hidden sm:gap-4">
          <OrdersFulfilledCounter
            variant="default"
            count={TRUST_ORDER_METRICS.ordersFulfilled}
          />
          <TrustpilotWidget variant="compact" />
        </div>
      )}
    </div>
  );
}
