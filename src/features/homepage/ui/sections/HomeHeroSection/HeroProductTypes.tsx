import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";
import { HOME_CATEGORY_TILES } from "@/features/homepage/lib/constants/marketplaceSections";
import { heroProductTypeVariants } from "@/features/homepage/lib/variants/heroProductTypeVariants";

/**
 * HeroProductTypes
 *
 * Row of tinted banners under the hero's two blocks, one per product type we
 * print (tees, hoodies, mugs, totes, canvas, kids), each a link to the
 * catalog. Reuses the category tiles' photos and names; the photo is
 * decorative, the name labels the link.
 */
export function HeroProductTypes() {
  const t = useTranslations("home.hero.productTypes");
  const tCategory = useTranslations("home.categories.items");

  return (
    <List aria-label={t("label")} className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
      {HOME_CATEGORY_TILES.map((type) => (
        <li key={type.id}>
          <Link href={type.href} className={heroProductTypeVariants({ tone: type.tone })}>
            <Span unstyled className="relative block size-14 shrink-0 overflow-hidden rounded-md bg-(--color-stamp-white) sm:size-16">
              <Image
                src={type.src}
                alt=""
                fill
                sizes="64px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Span>
            <Span unstyled className="flex min-w-0 flex-col gap-0.5">
              <Span unstyled className="font-body text-base font-bold text-(--color-stamp-chocolate)">
                {tCategory(type.id)}
              </Span>
              <Span unstyled className="text-sm text-(--color-stamp-taupe)">
                {t("cta")}&nbsp;→
              </Span>
            </Span>
          </Link>
        </li>
      ))}
    </List>
  );
}
