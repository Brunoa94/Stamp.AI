/**
 * CartHeader
 *
 * Cart page header in the luxury brutalist style:
 * - Thin gold accent bar
 * - Large Anton title with a gold-accented word; light on the band's photo
 *   below xl, dark on its off-white side from xl (the photo is on the right)
 * - Wide-tracked taupe subtitle reporting the item count
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
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />

      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-off-white) xl:text-(--color-stamp-chocolate)"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <Span
              variant="serif"
              className="text-(--color-stamp-gold-light) xl:text-(--color-stamp-taupe)"
            >
              {chunks}
            </Span>
          ),
        })}
      </Heading>
    </header>
  );
}
