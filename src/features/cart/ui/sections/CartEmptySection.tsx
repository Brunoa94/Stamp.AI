/**
 * CartEmptySection
 *
 * Empty cart state in the luxury brutalist style:
 * - Cream icon plate with a subtle tilt
 * - Playfair serif italic headline
 * - Chocolate → gold CTA back to the stamp creator
 */

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

export function CartEmptySection() {
  const t = useTranslations("cart.empty");

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-32 text-center xl:col-span-12"
    >
      <div className="mb-8 flex h-40 w-40 rotate-3 items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
        <ShoppingBag
          className="h-16 w-16 text-(--color-stamp-taupe)/30"
          aria-hidden="true"
        />
      </div>

      <Heading
        as="h1"
        unstyled
        className="mb-4 font-heading text-4xl font-bold uppercase tracking-tight text-(--color-stamp-chocolate)"
      >
        {t("title")}
      </Heading>

      <Span variant="default" className="mb-10 text-(--color-stamp-taupe)">
        {t("subtitle")}
      </Span>

      <Button asChild variant="secondary-brown" className="group">
        <Link href="/stamp">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t("cta")}
        </Link>
      </Button>
    </div>
  );
}
