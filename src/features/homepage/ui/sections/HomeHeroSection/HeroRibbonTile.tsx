import Image from "next/image";

interface PropsI {
  src: string;
}

/**
 * HeroRibbonTile
 *
 * One product photo in the hero photo ribbon. Loaded eagerly so the ribbon
 * right under the hero is ready before the visitor scrolls to it; not
 * preloaded, so it doesn't compete with the hero backdrop.
 */
export function HeroRibbonTile({ src }: PropsI) {
  return (
    <div className="relative h-32 w-44 shrink-0 overflow-hidden rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-sage) shadow-(--shadow-stamp-card)">
      <Image src={src} alt="" fill sizes="180px" loading="eager" className="object-cover" />
    </div>
  );
}
