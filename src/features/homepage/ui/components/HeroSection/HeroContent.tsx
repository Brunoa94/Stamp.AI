/**
 * HeroContent
 *
 * Hero section text content with title, tagline, CTAs, and trust indicators.
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

interface HeroContentProps {
  transform: {
    translateY: number;
    scale: number;
  };
  opacity: number;
}

export function HeroContent({ transform, opacity }: HeroContentProps) {
  const t = useTranslations("home.hero");

  return (
    <div
      className="hero-scroll-up lg:col-span-7"
      style={{
        transform: `translateY(${transform.translateY}px) scale(${transform.scale})`,
        opacity,
      }}
    >
      <Heading
        as="h1"
        variant="title"
        className="relative mb-10 text-7xl text-(--color-stamp-chocolate) md:text-8xl lg:text-9xl"
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
        <div
          aria-hidden
          className="absolute -inset-4 -z-10 bg-linear-to-r from-(--color-stamp-chocolate)/10 via-(--color-stamp-gold)/15 to-(--color-stamp-cream)/20 opacity-60 blur-3xl"
        />
      </Heading>

      <Paragraph
        variant="lead"
        className="mb-12 max-w-xl text-(--color-stamp-chocolate)/70"
      >
        {t("tagline")}
      </Paragraph>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild variant="cta" className="group">
          <Link href="/stamp">
            {t("ctaPrimary")}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost-stamp"
          className="border border-(--color-stamp-divider) hover:border-(--color-stamp-gold)"
        >
          <Link href="#products">{t("ctaSecondary")}</Link>
        </Button>
      </div>

      <HomeTrustIndicators items={HOME_HERO_TRUST} className="mt-16" />
    </div>
  );
}
