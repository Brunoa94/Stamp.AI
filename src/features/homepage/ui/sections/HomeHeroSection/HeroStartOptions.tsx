"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { HERO_START_OPTIONS } from "@/features/homepage/lib/constants/heroShowcase";
import type { HeroStartOptionT } from "@/features/homepage/lib/types/heroShowcase";
import { heroStartToggleVariants } from "@/features/homepage/lib/variants/heroStartVariants";
import { HeroStartCard } from "./HeroStartCard";

/**
 * HeroStartOptions
 *
 * The two ways into the creator, as a pair of toggle buttons over the start
 * card: from a photo (the default) or from words. Toggle buttons
 * (aria-pressed) rather than tabs, since each choice only swaps one link card.
 */
export function HeroStartOptions() {
  const t = useTranslations("home.hero.startOptions");
  const [selected, setSelected] = useState<HeroStartOptionT>(HERO_START_OPTIONS[0]);

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        role="group"
        aria-label={t("aria")}
        className="flex gap-1 rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-1"
      >
        {HERO_START_OPTIONS.map((option) => (
          <Button
            key={option.id}
            type="button"
            variant="unstyled"
            aria-pressed={option.id === selected.id}
            onClick={() => setSelected(option)}
            className={heroStartToggleVariants({ pressed: option.id === selected.id })}
          >
            <option.icon aria-hidden className="size-4 shrink-0" />
            {t(option.id)}
          </Button>
        ))}
      </div>
      <HeroStartCard option={selected} />
    </div>
  );
}
