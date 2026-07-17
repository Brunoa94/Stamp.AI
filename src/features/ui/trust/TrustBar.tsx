import { ShieldCheck, BadgeCheck, Package, Leaf } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";

/**
 * TrustBar
 *
 * A compact row of honest assurances (icon + short label) — the kind of
 * "why you can buy with confidence" strip used near CTAs, under the hero,
 * or on the cart/checkout. Each item maps to a `trust.bar.<key>` message.
 *
 * These are deliberately claims the business actually backs (secure checkout,
 * the stated guarantee, made-to-order, carbon-neutral shipping) — no invented
 * stats, badges, or press mentions.
 */

export interface TrustBarItem {
  key: string;
  Icon: LucideIcon;
}

const DEFAULT_ITEMS: TrustBarItem[] = [
  { key: "secureCheckout", Icon: ShieldCheck },
  { key: "guarantee", Icon: BadgeCheck },
  { key: "madeToOrder", Icon: Package },
  { key: "carbonNeutral", Icon: Leaf },
];

interface TrustBarProps {
  items?: TrustBarItem[];
  className?: string;
}

export function TrustBar({ items = DEFAULT_ITEMS, className }: TrustBarProps) {
  const t = useTranslations("trust.bar");

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-8 gap-y-3",
        className
      )}
    >
      {items.map(({ key, Icon }) => (
        <li key={key} className="flex items-center gap-2">
          <Icon
            className="h-4 w-4 text-(--color-stamp-gold)"
            aria-hidden="true"
          />
          <Span variant="micro" className="text-(--color-stamp-chocolate)">
            {t(key)}
          </Span>
        </li>
      ))}
    </ul>
  );
}
