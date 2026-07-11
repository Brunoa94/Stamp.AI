/**
 * HomePlatformIcon
 *
 * Platform-specific icons for social proof section.
 * Renders Google, Trustpilot, or ProductHunt logos.
 */

import { HOME_PLATFORM_CONFIG } from "../../lib/constants/homepageContent";

interface HomePlatformIconProps {
  platform: string;
  className?: string;
}

export function HomePlatformIcon({
  platform,
  className = "h-4 w-4",
}: HomePlatformIconProps) {
  const config = HOME_PLATFORM_CONFIG[platform];

  if (platform === "Google") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    );
  }

  if (platform === "Trustpilot") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill={config?.color ?? "#00B67A"}
        aria-hidden
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  }

  if (platform === "ProductHunt") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          fill={config?.color ?? "#DA552F"}
          d="M13.604 8.4h-3.405V12h3.405c.995 0 1.801-.806 1.801-1.8 0-.995-.806-1.8-1.801-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.803c2.319 0 4.2 1.881 4.2 4.2 0 2.32-1.881 4.2-4.2 4.2z"
        />
      </svg>
    );
  }

  return null;
}
