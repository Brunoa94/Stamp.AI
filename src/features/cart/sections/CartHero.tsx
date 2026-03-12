"use client";

import { cartTheme } from "@/theme/components";

interface CartHeroProps {
  itemCount: number;
}

export function CartHero({ itemCount }: CartHeroProps) {
  return (
    <div className={cartTheme.hero.container}>
      <div className={cartTheme.hero.titleRow}>
        <h1 className={cartTheme.hero.title}>Your Cart</h1>
        <span className={cartTheme.hero.itemCount}>
          {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}
        </span>
      </div>
      <p className={cartTheme.hero.subtitle}>Items reserved for 30 minutes</p>
    </div>
  );
}
