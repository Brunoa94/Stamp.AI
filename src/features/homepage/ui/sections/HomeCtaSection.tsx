/**
 * HomeCtaSection
 *
 * Inverted chocolate call-to-action: display headline with serif gold
 * accent, primary/outline CTAs and trust indicators.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Fingerprint } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { SectionReveal } from "../components/SectionReveal";

export function HomeCtaSection() {
  const t = useTranslations("home.cta");

  return (
    <section className="relative overflow-hidden bg-(--color-stamp-chocolate) px-6 py-32 lg:px-12 xl:px-24">
      <Fingerprint
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 text-(--color-stamp-gold)/10"
      />
      <SectionReveal
        className="relative mx-auto max-w-screen-2xl"
        parallax
        fadeOnScroll
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-10 h-1.5 w-20 bg-(--color-stamp-gold)" />
          <Heading
            as="h2"
            variant="cta"
            className="mb-10 text-(--color-stamp-off-white)"
          >
            {t.rich("heading", {
              accent: (chunks) => (
                <Span variant="serif" className="text-(--color-stamp-gold)">
                  {chunks}
                </Span>
              ),
            })}
          </Heading>

          <Paragraph
            variant="lead"
            className="mb-14 max-w-2xl text-(--color-stamp-taupe)"
          >
            {t("lead")}
          </Paragraph>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button asChild variant="cta-gold" className="group">
              <Link href="/stamp">
                {t("ctaPrimary")}
                <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </Button>
            <Button asChild variant="ghost-stamp-light">
              <Link href="/products">{t("ctaSecondary")}</Link>
            </Button>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
