"use client";

/**
 * HeroContent
 *
 * Hero copy: Stamp.ai wordmark, headline with a rotating handwritten product word,
 * tagline, the upload card that opens the creator, the free-credits
 * line and trust signals. Light ink over the photo backdrop, with the
 * headline as the largest element and the wordmark as a smaller kicker above
 * it; the trust row sits on its own off-white pill and only renders while
 * real social proof is enabled (TRUST_SOCIAL_PROOF_ENABLED). Centered when
 * stacked; left-aligned beside the flow demo on xl+.
 */

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { HeroAnimatedTitle } from "./HeroAnimatedTitle";
import { HeroBrandLockup } from "./HeroBrandLockup";
import { HeroRotatingWord } from "./HeroRotatingWord";
import { HeroUploadCard } from "./HeroUploadCard";
import { OrdersFulfilledCounter } from "@/features/ui/trust/OrdersFulfilledCounter";
import { TrustpilotWidget } from "@/features/ui/trust/TrustpilotWidget";
import {
  TRUST_ORDER_METRICS,
  TRUST_SOCIAL_PROOF_ENABLED,
} from "@/shared/constants/trustMetrics";

export function HeroContent() {
  const t = useTranslations("home.hero");

  return (
    <div className="hero-copy flex flex-col items-center gap-6 text-center sm:gap-7 xl:items-start xl:text-left">
      <HeroBrandLockup />

      <HeroAnimatedTitle>
        <Heading
          as="h1"
          variant="title"
          className="text-5xl leading-[0.95] text-(--color-stamp-off-white) sm:text-6xl md:text-6xl lg:text-7xl xl:text-6xl 2xl:text-7xl"
        >
          {t.rich("headline", {
            br: () => <br />,
            word: () => <HeroRotatingWord />,
          })}
        </Heading>
      </HeroAnimatedTitle>

      <Paragraph
        variant="heroTagline"
        className="max-w-lg text-(--color-stamp-off-white) xl:text-2xl"
      >
        {t("tagline")}
      </Paragraph>

      <HeroUploadCard />

      {/* Free credits highlight */}
      <Span
        as="p"
        variant="serif"
        className="text-2xl text-(--color-stamp-cream) sm:text-3xl"
      >
        {t.rich("freeCredits", {
          signUp: (chunks) => (
            <Button
              variant="link"
              className="inline p-0 h-auto font-serif italic lowercase text-(--color-stamp-gold-light) hover:text-(--color-stamp-off-white)! text-2xl sm:text-3xl font-bold"
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
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-(--color-stamp-off-white)/95 px-4 py-2 shadow-lg text-shadow-none empty:hidden sm:gap-4">
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
