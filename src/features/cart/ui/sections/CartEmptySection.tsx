/**
 * CartEmptySection
 *
 * Empty cart state: a round cream icon plate, a slab-serif headline, a
 * supporting line and the chocolate → amber CTA back to the stamp creator.
 */

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

export function CartEmptySection() {
  const t = useTranslations("cart.empty");

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-16 text-center xl:col-span-12"
    >
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-(--color-stamp-cream)">
        <ShoppingBag
          className="h-14 w-14 text-(--color-stamp-taupe)/40"
          aria-hidden="true"
        />
      </div>

      {/* The page's h1 is CartHeader's, in the band above */}
      <Heading
        as="h2"
        variant="sectionSlab"
        className="mb-3 text-(--color-stamp-chocolate)"
      >
        {t("title")}
      </Heading>

      <Paragraph variant="xs" className="mb-10 max-w-md text-(--color-stamp-taupe)">
        {t("subtitle")}
      </Paragraph>

      <Button asChild variant="primary" className="group">
        <Link href="/stamp">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t("cta")}
        </Link>
      </Button>
    </div>
  );
}
