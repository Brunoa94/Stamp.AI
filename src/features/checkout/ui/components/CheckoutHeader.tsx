/**
 * CheckoutHeader
 *
 * Checkout page header, inside the mirrored PageHeaderBand like the cart's:
 * amber accent bar, slab-serif title with a handwritten accent word and a
 * one-line subtitle. Light on the band's photo below xl, dark on its cream
 * side from xl (the photo is on the right).
 */

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

export function CheckoutHeader() {
  const t = useTranslations("checkout.header");

  return (
    <header className="space-y-4 text-shadow-lg xl:text-shadow-none">
      <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-off-white) xl:text-(--color-stamp-chocolate)"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <Span
              variant="serif"
              className="text-(--color-stamp-gold-light) xl:text-(--color-stamp-gold-text)"
            >
              {chunks}
            </Span>
          ),
        })}
      </Heading>
      <Paragraph
        variant="xs"
        className="text-(--color-stamp-off-white) md:text-lg xl:text-(--color-stamp-taupe)"
      >
        {t("subtitle")}
      </Paragraph>
    </header>
  );
}
