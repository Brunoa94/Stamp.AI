import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import type { CatalogCategorySectionType } from "../../lib/types/catalogPageTypes";

/**
 * CatalogCategoryNav
 *
 * Anchor navigation over the catalog's category sections: one pill per
 * non-empty category linking to its section, with a product count.
 */

interface PropsI {
  sections: CatalogCategorySectionType[];
}

export function CatalogCategoryNav({ sections }: PropsI) {
  const t = useTranslations("catalog");

  return (
    <nav aria-label={t("categoryNavAria")}>
      <ul className="flex flex-wrap gap-3">
        {sections.map((section) => (
          <li key={section.category}>
            <a
              href={`#category-${section.category}`}
              className="inline-flex items-baseline gap-2 border border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 py-2.5 transition-colors duration-300 hover:border-(--color-stamp-gold) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)"
            >
              <Span
                variant="micro"
                className="text-(--color-stamp-chocolate)"
              >
                {t(`categories.${section.category}`)}
              </Span>
              <Span variant="micro" className="text-(--color-stamp-taupe)">
                {section.products.length}
              </Span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
