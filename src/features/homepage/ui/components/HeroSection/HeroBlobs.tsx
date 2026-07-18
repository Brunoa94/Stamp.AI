/**
 * HeroBlobs
 *
 * Animated blur blob decorations for the hero section with parallax effect.
 */

interface HeroBlobsProps {
  blobTranslates: readonly [number, number, number];
}

export function HeroBlobs({ blobTranslates }: HeroBlobsProps) {
  return (
    <>
      <div
        aria-hidden
        className="hero-blur-blob hero-blob-purple hero-blob-parallax absolute -left-40 -top-40 opacity-20"
        style={{ transform: `translateY(${blobTranslates[0]}px)` }}
      />
      <div
        aria-hidden
        className="hero-blur-blob hero-blob-cyan hero-blob-parallax absolute right-[-5%] top-1/2 opacity-15"
        style={{ transform: `translateY(${blobTranslates[1]}px)` }}
      />
      <div
        aria-hidden
        className="hero-blur-blob hero-blob-orange hero-blob-parallax absolute bottom-0 left-1/3 opacity-15"
        style={{ transform: `translateY(${blobTranslates[2]}px)` }}
      />
    </>
  );
}
