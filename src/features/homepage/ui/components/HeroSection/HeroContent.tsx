"use client";

/**
 * HeroContent
 *
 * Hero copy: Stamp.ai wordmark, headline with a rotating handwritten product word,
 * tagline, the upload card that opens the creator, the free-credits
 * line and trust signals. Centered when stacked; left-aligned beside the
 * flow demo on xl+.
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

export function HeroContent() {
  const t = useTranslations("home.hero");

  return (
    <div className="flex flex-col items-center gap-6 text-center sm:gap-7 xl:items-start xl:text-left">
      <HeroBrandLockup />

      <HeroAnimatedTitle>
        <Heading
          as="h1"
          variant="title"
          className="text-3xl leading-none text-(--color-stamp-chocolate) sm:text-4xl md:text-5xl lg:text-6xl xl:text-4xl 2xl:text-6xl"
        >
          {t.rich("headline", {
            br: () => <br />,
            word: () => <HeroRotatingWord />,
          })}
        </Heading>
      </HeroAnimatedTitle>

      <Paragraph
        variant="heroTagline"
        className="max-w-xl text-(--color-stamp-chocolate)/80 xl:text-2xl"
      >
        {t("tagline")}
      </Paragraph>

      <HeroUploadCard />

      {/* Free credits highlight */}
      <Span
        as="p"
        variant="serif"
        className="text-2xl text-(--color-stamp-taupe) sm:text-3xl"
      >
        {t.rich("freeCredits", {
          signUp: (chunks) => (
            <Button
              variant="link"
              className="inline p-0 h-auto font-serif italic lowercase text-(--color-stamp-gold-text) hover:text-(--color-stamp-chocolate)! sm:text-3xl font-bold"
              onClick={() => {
                document.dispatchEvent(new CustomEvent("open-auth-modal"));
              }}
            >
              {chunks}
            </Button>
          ),
        })}
      </Span>

      {/* Trust signals - above fold */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 xl:justify-start">
        <OrdersFulfilledCounter variant="default" />
        <TrustpilotWidget variant="compact" />
      </div>
    </div>
  );
}
