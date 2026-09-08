/**
 * CheckoutNotFoundSection
 *
 * Error state shown when the checkout cart cannot be resolved. Provides a
 * clear message and a recovery path back to the cart.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { PackageX } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

export function CheckoutNotFoundSection() {
  const t = useTranslations("checkout.notFound");

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-stamp-off-white) px-6 text-(--color-stamp-chocolate)">
      <div
        role="alert"
        className="max-w-md border border-(--color-stamp-divider) bg-(--color-stamp-white) p-12 text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
          <PackageX
            className="h-10 w-10 text-(--color-stamp-taupe)"
            aria-hidden="true"
          />
        </div>
        <Heading
          as="h1"
          unstyled
          className="mb-4 font-heading text-3xl font-bold uppercase tracking-tight"
        >
          {t("title")}
        </Heading>
        <Paragraph variant="sm" className="mb-8 text-(--color-stamp-taupe)">
          {t("description")}
        </Paragraph>
        <Button asChild variant="primary">
          <Link href="/cart">{t("backToCart")}</Link>
        </Button>
      </div>
    </div>
  );
}
