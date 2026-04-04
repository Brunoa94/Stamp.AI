import { Edit3 } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import type { UserI } from "@/types/auth";
import { Button } from "@/features/ui/button";
import Image from "next/image";

interface ProfileSummaryCardProps {
  user?: UserI | null;
}

function getAvatarSeed(user?: UserI | null) {
  return user?.email || user?.id || "stamp-ai";
}

export function ProfileSummaryCard({ user }: ProfileSummaryCardProps) {
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "Stamp Creator";

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      getAvatarSeed(user),
    )}`;

  return (
    <section className={dashboardTheme.card.base}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`${dashboardTheme.profile.avatarWrap} relative`}>
          <Image
            src={avatarUrl}
            alt={displayName}
            fill
            sizes="64px"
            unoptimized
            className={dashboardTheme.profile.avatar}
          />
        </div>
        <div>
          <h3 className={dashboardTheme.profile.name}>{displayName}</h3>
          <p className={dashboardTheme.profile.email}>{user?.email}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        className={dashboardTheme.profile.editButton}
      >
        <Edit3 className="w-4 h-4" />
        Edit Profile
      </Button>
    </section>
  );
}
