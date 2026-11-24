/**
 * HomeCategoriesSection
 *
 * "Shop by category": a row of framed product tiles, scrolling sideways on
 * narrow screens.
 */

import { useTranslations } from "next-intl";
import { List } from "@/features/ui/list";
import { HOME_CATEGORY_TILES } from "@/features/homepage/lib/constants/marketplaceSections";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";
import { CategoryTile } from "./CategoryTile";

export function HomeCategoriesSection() {
  const t = useTranslations("home.categories");

  return (
    <section aria-labelledby="home-categories-title" className="px-4 py-20 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-screen-2xl">
        <HomeSectionHeader id="home-categories-title" title={t("title")} className="mb-10" />
        <List className="scrollbar-hide -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {HOME_CATEGORY_TILES.map((category) => (
            <li key={category.id} className="w-32 shrink-0 snap-start sm:w-auto">
              <CategoryTile href={category.href} src={category.src} label={t(`items.${category.id}`)} />
            </li>
          ))}
        </List>
      </div>
    </section>
  );
}
