/**
 * HeroContent
 *
 * Hero section text content with animated title, tagline, CTAs, and trust indicators.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { HOME_HERO_TRUST } from "../../../lib/constants/homepageContent";
import { HomeTrustIndicators } from "../HomeTrustIndicators";
import { HeroAnimatedTitle } from "./HeroAnimatedTitle";

export function HeroContent() {
  const t = useTranslations("home.hero");

  return (
    <div>
      <HeroAnimatedTitle>
        <Heading
          as="h1"
          variant="title"
          className="mb-10 text-7xl text-(--color-stamp-chocolate) md:text-8xl lg:text-9xl"
        >
          {t.rich("title", {
            accent: (chunks) => (
              <Span
                variant="serif"
                className="text-7xl text-(--color-stamp-taupe) md:text-8xl lg:text-9xl"
              >
                {chunks}
              </Span>
            ),
          })}
        </Heading>
      </HeroAnimatedTitle>

      <Paragraph
        variant="heroTagline"
        className="mx-auto mb-12 max-w-xl text-(--color-stamp-chocolate)/80"
      >
        {t("tagline")}
      </Paragraph>

      <div className="flex flex-col justify-center gap-4 sm:flex-row items-center">
        <Button asChild variant="cta" className="group">
          <Link href="/stamp">
            {t("ctaPrimary")}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="text-lg text-(--color-stamp-taupe) hover:text-(--color-stamp-gold) hover:bg-transparent"
          onClick={() => {
            document
              .getElementById("products")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {t("ctaSecondary")}
        </Button>
      </div>

      <HomeTrustIndicators
        items={HOME_HERO_TRUST}
        className="mt-16 justify-center"
      />
    </div>
  );
}
