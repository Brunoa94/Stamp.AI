/**
 * DashboardCtaSection
 *
 * Chocolate call-to-action panel linking to the stamp flow.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Fingerprint } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

export function DashboardCtaSection() {
  const t = useTranslations("dashboard.cta");

  return (
    <section className="relative overflow-hidden rounded-2xl bg-(--color-stamp-chocolate) p-8 lg:p-12">
      <Fingerprint
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-(--color-stamp-gold)/10"
      />
      <div className="relative space-y-5">
        <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
        <Heading
          as="h2"
          variant="card"
          className="text-(--color-stamp-off-white)"
        >
          {t.rich("title", {
            accent: (chunks) => (
              <Span variant="serif" className="text-(--color-stamp-gold-light)">
                {chunks}
              </Span>
            ),
          })}
        </Heading>
        <Paragraph variant="xs" className="text-(--color-stamp-taupe-light) md:text-lg">
          {t("subtitle")}
        </Paragraph>
        <Button asChild variant="cta-gold" className="group">
          <Link href="/stamp">
            {t("cta")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
