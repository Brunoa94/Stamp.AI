/**
 * CartHeader
 *
 * Cart page header, inside the mirrored PageHeaderBand:
 * - Amber accent bar
 * - Slab-serif page title with a handwritten accent word; light on the band's
 *   photo below xl, dark on its cream side from xl (the photo is on the right)
 */

import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { useTranslations } from "next-intl";

interface CartHeaderPropsI {
  itemCount: number;
}

export function CartHeader({ itemCount }: CartHeaderPropsI) {
  const t = useTranslations("cart.header");

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
    </header>
  );
}
