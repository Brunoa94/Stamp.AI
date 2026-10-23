import Image from "next/image";

/**
 * HeroBackdrop
 *
 * Decorative background of the hero's first screen: an editorial photo with a
 * slow Ken Burns drift. On xl+ it's cut on a diagonal behind the copy, edged
 * by a thin gold seam, leaving the flow demo on the off-white side; below xl
 * it fills the screen under a darker scrim. Clip paths and scrims live in
 * globals.css (`.hero-backdrop__*`).
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="hero-backdrop__photo absolute inset-0 overflow-hidden bg-(--color-stamp-chocolate)">
        <div className="hero-backdrop__photo-img absolute inset-y-0 left-0 w-full xl:w-[58%]">
          <Image
            src="/home/hero-backdrop.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 58vw, 100vw"
            className="object-cover object-top"
          />
        </div>
        <div className="hero-backdrop__scrim absolute inset-0" />
      </div>
      <div className="hero-backdrop__seam absolute inset-0 hidden bg-(--color-stamp-gold) xl:block" />
    </div>
  );
}
