import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import type { CatalogCategorySectionType } from "../../lib/types/catalogPageTypes";
import { CatalogProductCard } from "../components/CatalogProductCard";

/**
 * CatalogCategorySection
 *
 * One category of the catalog: heading with product count and the
 * product card grid. Anchored for the category navigation, with a
 * scroll margin clearing the fixed h-24 header.
 */

interface PropsI {
  section: CatalogCategorySectionType;
}

export function CatalogCategorySection({ section }: PropsI) {
  const t = useTranslations("catalog");

  return (
    <section
      id={`category-${section.category}`}
      aria-label={t(`categories.${section.category}`)}
      className="scroll-mt-32"
    >
      <div className="mb-10 flex items-baseline gap-4 border-b border-(--color-stamp-divider) pb-4">
        <Heading
          as="h2"
          variant="sectionSlab"
          className="text-(--color-stamp-chocolate)"
        >
          {t(`categories.${section.category}`)}
        </Heading>
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("productCount", { count: section.products.length })}
        </Span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4 lg:gap-12">
        {section.products.map((product) => (
          <CatalogProductCard key={product.blueprintId} product={product} />
        ))}
      </div>
    </section>
  );
}
