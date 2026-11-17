"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { useCartItemCount } from "@/shared/queries/cartQueries";
import { formatCartBadgeCount } from "@/features/stamp/lib/helpers/stampNavHelpers";
import {
  stampNavBadgeVariants,
  stampNavIconButtonVariants,
} from "@/features/stamp/lib/variants/stampNavVariants";

interface PropsI {
  onNavigate: () => void;
}

/**
 * Bag icon with a live item count. Until the count is known (loading or
 * failed) it shows no badge and the plain "Bag" label, never "empty".
 */
export function StampCartLink({ onNavigate }: PropsI) {
  const t = useTranslations("stamp.header");
  const itemCount = useCartItemCount();
  const badge = itemCount === null ? null : formatCartBadgeCount(itemCount);

  return (
    <Link
      href="/cart"
      onClick={onNavigate}
      aria-label={itemCount === null ? t("cart") : t("cartAria", { count: itemCount })}
      className={stampNavIconButtonVariants()}
    >
      <ShoppingBag className="size-5" strokeWidth={1.75} aria-hidden />
      {badge && (
        <Span unstyled aria-hidden className={stampNavBadgeVariants()}>
          {badge}
        </Span>
      )}
    </Link>
  );
}
