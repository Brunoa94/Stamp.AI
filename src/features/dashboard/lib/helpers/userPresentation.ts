import type { UserI } from "@/types/auth";

/**
 * User display helpers for the dashboard header and profile card.
 */

export function getDisplayName(user: UserI | null | undefined): string {
  if (!user) return "Artist";
  return (
    (user.user_metadata?.full_name as string | undefined) ||
    user.user_metadata?.first_name ||
    user.email?.split("@")[0] ||
    "Artist"
  );
}

export function getAvatarUrl(user: UserI | null | undefined): string {
  if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
  const seed = user?.email || user?.id || "stamp-ai";
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function isEmailVerified(user: UserI | null | undefined): boolean {
  return Boolean(user?.email_confirmed_at);
}
