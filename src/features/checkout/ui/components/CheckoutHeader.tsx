/**
 * CheckoutHeader
 *
 * Checkout page header matching the luxury brutalist system:
 * gold accent bar, Anton title with a gold-accented word, taupe subtitle.
 */

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

export function CheckoutHeader() {
  const t = useTranslations("checkout.header");

  return (
    <header className="space-y-4">
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-chocolate)"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
              {chunks}
            </span>
          ),
        })}
      </Heading>
      <Span variant="default" className="text-(--color-stamp-taupe)">
        {t("subtitle")}
      </Span>
    </header>
  );
}
