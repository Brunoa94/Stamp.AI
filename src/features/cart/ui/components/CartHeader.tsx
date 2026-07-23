/**
 * CartHeader
 *
 * Cart page header in the luxury brutalist style:
 * - Thin gold accent bar
 * - Large Anton title with a gold-accented word
 * - Wide-tracked taupe subtitle reporting the item count
 */

import { Heading } from "@/features/ui/heading";
import { useTranslations } from "next-intl";

interface CartHeaderPropsI {
  itemCount: number;
}

export function CartHeader({ itemCount }: CartHeaderPropsI) {
  const t = useTranslations("cart.header");

  return (
    <header className="space-y-4 xl:col-span-12">
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
    </header>
  );
}
