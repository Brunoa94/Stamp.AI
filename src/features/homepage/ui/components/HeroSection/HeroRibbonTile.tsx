import Image from "next/image";

interface PropsI {
  src: string;
}

/**
 * HeroRibbonTile
 *
 * One product photo in the hero photo ribbon.
 */
export function HeroRibbonTile({ src }: PropsI) {
  return (
    <div className="relative h-32 w-44 shrink-0 overflow-hidden rounded-xl bg-(--color-stamp-white) shadow-sm ring-1 ring-(--color-stamp-chocolate)/5">
      <Image src={src} alt="" fill sizes="180px" className="object-cover" />
    </div>
  );
}
