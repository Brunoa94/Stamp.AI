"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { isStampNavItemActive } from "@/features/stamp/lib/helpers/stampNavHelpers";
import { stampNavLinkVariants } from "@/features/stamp/lib/variants/stampNavVariants";
import type { StampNavItemT } from "@/features/stamp/lib/types/stampNavTypes";

interface PropsI {
  items: StampNavItemT[];
  pathname: string;
}

/** Centred text links shown from the `lg` breakpoint up. */
export function StampDesktopNav({ items, pathname }: PropsI) {
  const t = useTranslations("stamp.header");

  return (
    <nav
      aria-label={t("mainNavAria")}
      className="hidden items-center gap-1 lg:flex"
    >
      {items.map((item) => {
        const active = isStampNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={stampNavLinkVariants({ active })}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
