/**
 * HomePlatformIcon
 *
 * Platform-specific icons for social proof section.
 * Renders Google, Trustpilot, or ProductHunt logos.
 */

import Image from "next/image";

const PLATFORM_ICON_SRC: Record<string, string> = {
  Google: "/assets/google-icon.svg",
  Trustpilot: "/assets/platforms/trustpilot.svg",
  ProductHunt: "/assets/platforms/producthunt.svg",
};

interface HomePlatformIconProps {
  platform: string;
  className?: string;
}

export function HomePlatformIcon({
  platform,
  className = "h-4 w-4",
}: HomePlatformIconProps) {
  const src = PLATFORM_ICON_SRC[platform];

  if (!src) return null;

  return <Image src={src} alt="" aria-hidden width={16} height={16} className={className} />;
}
