/**
 * CheckoutNotFoundSection
 *
 * Error state shown when the checkout cart cannot be resolved: a card in
 * the shared style with a round icon plate, a clear message and a recovery
 * path back to the cart.
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
    <div className="flex min-h-screen items-center justify-center bg-(--color-stamp-off-white) px-4 pb-16 pt-28 text-(--color-stamp-chocolate) sm:px-6 lg:px-12">
      <div
        role="alert"
        className="w-full max-w-md rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 text-center shadow-(--shadow-stamp-card) md:p-12"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-(--color-stamp-cream)">
          <PackageX
            className="h-10 w-10 text-(--color-stamp-taupe)"
            aria-hidden="true"
          />
        </div>
        <Heading
          as="h1"
          variant="sectionSlab"
          className="mb-3 text-(--color-stamp-chocolate)"
        >
          {t("title")}
        </Heading>
        <Paragraph variant="xs" className="mb-8 text-(--color-stamp-taupe)">
          {t("description")}
        </Paragraph>
        <Button asChild variant="primary">
          <Link href="/cart">{t("backToCart")}</Link>
        </Button>
      </div>
    </div>
  );
}
