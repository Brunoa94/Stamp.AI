/**
 * ReviewsPlatformBadge
 *
 * Platform badge with icon and name, styled with platform-specific colors.
 */

import { Span } from "@/features/ui/span";
import { HOME_PLATFORM_CONFIG } from "../../../lib/constants/homepageContent";
import { HomePlatformIcon } from "../HomePlatformIcon";

interface ReviewsPlatformBadgeProps {
  platform: string;
  variant?: "pill" | "inline";
}

export function ReviewsPlatformBadge({
  platform,
  variant = "pill",
}: ReviewsPlatformBadgeProps) {
  const config = HOME_PLATFORM_CONFIG[platform];

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        <HomePlatformIcon platform={platform} />
        <Span
          variant="micro"
          style={{ color: config?.color }}
          className="font-medium"
        >
          {platform}
        </Span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-full border px-3 py-1.5"
      style={{
        backgroundColor: config?.bgColor ?? "transparent",
        borderColor: config?.borderColor ?? "transparent",
      }}
    >
      <HomePlatformIcon platform={platform} />
      <Span
        variant="micro"
        style={{ color: config?.color }}
        className="font-medium"
      >
        {platform}
      </Span>
    </div>
  );
}
