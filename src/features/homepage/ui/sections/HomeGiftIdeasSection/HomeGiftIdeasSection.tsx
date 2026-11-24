/**
 * HomeGiftIdeasSection
 *
 * Editorial mosaic of gift occasions: one large tile beside four smaller
 * ones on wide screens, a two-column grid on phones. Every tile opens the
 * design studio.
 */

import { useTranslations } from "next-intl";
import { List } from "@/features/ui/list";
import { GIFT_IDEA_TILES } from "@/features/homepage/lib/constants/marketplaceSections";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";
import { GiftIdeaTile } from "./GiftIdeaTile";

export function HomeGiftIdeasSection() {
  const t = useTranslations("home.giftIdeas");
  const [featured, ...rest] = GIFT_IDEA_TILES;

  return (
    <section
      id="gift-ideas"
      aria-labelledby="home-gift-ideas-title"
      className="scroll-mt-28 px-4 py-20 sm:px-6 lg:px-12"
    >
      <div className="mx-auto max-w-screen-2xl">
        <HomeSectionHeader
          id="home-gift-ideas-title"
          title={t("title")}
          subtitle={t("subtitle")}
          className="mb-10"
        />
        <List className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <li className="col-span-2 lg:row-span-2">
            <GiftIdeaTile src={featured.src} label={t(`tiles.${featured.id}`)} size="large" />
          </li>
          {rest.map((tile) => (
            <li key={tile.id}>
              <GiftIdeaTile src={tile.src} label={t(`tiles.${tile.id}`)} size="small" />
            </li>
          ))}
        </List>
      </div>
    </section>
  );
}
