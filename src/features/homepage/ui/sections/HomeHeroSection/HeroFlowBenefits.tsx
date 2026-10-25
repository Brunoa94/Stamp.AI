"use client";

import { useTranslations } from "next-intl";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";
import { HERO_FLOW_BENEFITS } from "@/features/homepage/lib/constants/heroShowcase";

/**
 * HeroFlowBenefits
 *
 * Row of three small banners under the flow demo, on the hero's off-white
 * side: what the creation flow spares the visitor (no design skills, a preview
 * before ordering, printing on demand). Same card language as the demo window.
 */
export function HeroFlowBenefits() {
  const t = useTranslations("home.hero.flowBenefits");

  return (
    <List role="list" className="grid w-full max-w-160 grid-cols-3 gap-3">
      {HERO_FLOW_BENEFITS.map(({ id, icon: Icon }) => (
        <li
          key={id}
          className="flex items-center gap-3 rounded-lg border border-(--color-stamp-chocolate)/10 bg-(--color-stamp-cream) px-3 py-2.5"
        >
          <Span
            unstyled
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-(--color-stamp-chocolate)"
          >
            <Icon aria-hidden className="size-4.5 text-(--color-stamp-gold)" />
          </Span>
          <Span unstyled className="flex min-w-0 flex-col">
            <Span variant="micro" className="font-bold text-(--color-stamp-chocolate)">
              {t(`${id}.title`)}
            </Span>
            <Span unstyled className="text-xs text-(--color-stamp-taupe)">
              {t(`${id}.hint`)}
            </Span>
          </Span>
        </li>
      ))}
    </List>
  );
}
