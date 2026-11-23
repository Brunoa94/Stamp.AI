"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import type { HeroStartOptionT } from "@/features/homepage/lib/types/heroShowcase";
import {
  heroStartCardVariants,
  heroStartIconTileVariants,
  heroStartIconVariants,
} from "@/features/homepage/lib/variants/heroStartVariants";

interface PropsI {
  option: HeroStartOptionT;
}

/**
 * HeroStartCard
 *
 * Dashed start card on the hero card that opens the creator: "Upload a photo
 * to start" (step 01) or, for visitors without a photo, "Describe your idea"
 * (step 02, the creator's upload step is optional).
 */
export function HeroStartCard({ option }: PropsI) {
  const t = useTranslations(`home.hero.${option.id}`);
  const Icon = option.icon;

  return (
    <Link href="/stamp" className={heroStartCardVariants()}>
      <Span unstyled className={heroStartIconTileVariants()}>
        {/* The float runs on this wrapper: an animated <svg> transform repaints every frame, an HTML one stays on the compositor */}
        <Span unstyled className="flex animate-[float_3s_ease-in-out_infinite]">
          <Icon aria-hidden className={heroStartIconVariants()} />
        </Span>
      </Span>
      <Span unstyled className="flex min-w-0 flex-1 flex-col gap-1">
        <Span unstyled className="font-body text-lg font-bold text-(--color-stamp-chocolate)">
          {t("title")}
        </Span>
        <Span variant="label" className="text-(--color-stamp-taupe)">
          {t("hint")}
        </Span>
      </Span>
      <Span variant="script" className="hidden shrink-0 text-2xl text-(--color-stamp-taupe) sm:block">
        {t("step")}
      </Span>
    </Link>
  );
}
