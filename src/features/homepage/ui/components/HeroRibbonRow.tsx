interface PropsI {
  /** Seconds for one full loop; larger is slower */
  durationS: number;
  isReversed?: boolean;
  children: React.ReactNode;
}

/**
 * HeroRibbonRow
 *
 * Endless marquee row: renders its tiles twice and slides the track by half
 * its width, so the second copy takes over seamlessly. Pauses on hover.
 * Children must be at least as wide as the viewport for the loop to be seamless.
 */
export function HeroRibbonRow({ durationS, isReversed = false, children }: PropsI) {
  return (
    <div
      className="animate-hero-marquee flex w-max hover:[animation-play-state:paused]"
      style={{
        animationDuration: `${durationS}s`,
        animationDirection: isReversed ? "reverse" : "normal",
      }}
    >
      <div className="flex shrink-0 gap-3 pr-3">{children}</div>
      <div className="flex shrink-0 gap-3 pr-3">{children}</div>
    </div>
  );
}
