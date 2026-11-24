"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { List } from "@/features/ui/list";
import { HEADER_CATEGORY_LINKS } from "@/features/stamp/lib/constants/headerCategoryLinks";
import { stampNavCategoryLinkVariants } from "@/features/stamp/lib/variants/stampNavVariants";

/**
 * StampHeaderCategoryNav
 *
 * The header's second row: quick links into the studio, the catalog and the
 * homepage's shopping sections. Scrolls sideways when it doesn't fit.
 */
export function StampHeaderCategoryNav() {
  const t = useTranslations("stamp.header");

  return (
    <nav aria-label={t("categoryNavAria")} className="scrollbar-hide overflow-x-auto">
      <List className="flex items-center justify-center">
        {HEADER_CATEGORY_LINKS.map((link) => (
          <li
            key={link.id}
            className="flex items-center before:px-0.5 before:text-(--color-stamp-taupe-light) before:content-['·'_/_''] first:before:content-none lg:before:px-1"
          >
            <Link href={link.href} className={stampNavCategoryLinkVariants()}>
              {t(`categories.${link.id}`)}
            </Link>
          </li>
        ))}
      </List>
    </nav>
  );
}
