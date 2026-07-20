/** TO REFACTOR: There are components here with styling applied directly and not through the variants. Refactor them to use variants */

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

export function HeroContent() {
  const t = useTranslations("home.hero");

  return (
    <div className="lg:col-span-7">
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

      <Paragraph
        variant="heroTagline"
        className="mb-12 max-w-xl text-(--color-stamp-chocolate)/80"
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
