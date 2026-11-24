/**
 * HomeCtaSection
 *
 * Closing chocolate band: an amber bar, the headline with a handwritten
 * amber accent word, one line of reassurance, and the amber "start" action
 * beside a light ghost link to the catalog.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

export function HomeCtaSection() {
  const t = useTranslations("home.cta");

  return (
    <section aria-labelledby="home-cta-title" className="px-4 py-20 sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center rounded-2xl bg-(--color-stamp-chocolate) px-6 py-16 text-center sm:px-10 lg:py-24">
        <div aria-hidden className="mb-8 h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
        <Heading as="h2" id="home-cta-title" variant="sectionDisplay" className="max-w-3xl text-(--color-stamp-off-white)">
          {t.rich("heading", {
            accent: (chunks) => (
              <Span variant="serif" className="text-(--color-stamp-gold-light)">
                {chunks}
              </Span>
            ),
          })}
        </Heading>
        <Paragraph variant="xs" className="mt-5 max-w-2xl text-(--color-stamp-taupe-light) md:text-lg">
          {t("lead")}
        </Paragraph>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild variant="cta-gold" className="group">
            <Link href="/stamp">
              {t("ctaPrimary")}
              <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="ghost-stamp-light">
            <Link href="/catalog">{t("ctaSecondary")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
