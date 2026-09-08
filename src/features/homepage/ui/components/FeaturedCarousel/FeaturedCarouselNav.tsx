/**
 * FeaturedCarouselNav
 *
 * Navigation buttons for the featured carousel (left/right arrows).
 */

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";

interface FeaturedCarouselNavProps {
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export function FeaturedCarouselNav({
  onScrollLeft,
  onScrollRight,
}: FeaturedCarouselNavProps) {
  const t = useTranslations("home.featured");

  return (
    <div className="mb-4 hidden gap-3 sm:flex">
      <Button
        variant="ghost"
        size="icon"
        onClick={onScrollLeft}
        aria-label={t("scrollLeft")}
        className="h-12 w-12 border border-(--color-stamp-divider) bg-(--color-stamp-white) text-(--color-stamp-chocolate) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-gold) hover:bg-(--color-stamp-white)"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onScrollRight}
        aria-label={t("scrollRight")}
        className="h-12 w-12 border border-(--color-stamp-divider) bg-(--color-stamp-white) text-(--color-stamp-chocolate) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-gold) hover:bg-(--color-stamp-white)"
      >
        <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
