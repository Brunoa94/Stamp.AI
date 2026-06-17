import type { UserI } from "@/types/auth";

export function getAvatarSeed(user?: UserI | null): string {
  return user?.email || user?.id || "stamp-ai";
}
