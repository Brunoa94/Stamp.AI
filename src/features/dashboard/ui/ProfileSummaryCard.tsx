import Image from "next/image";
import { dashboardTheme } from "@/theme/components";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { BrutalistCard } from "./BrutalistCard";
import { getAvatarSeed } from "../lib/helpers/getAvatarSeed";
import type { UserI } from "@/types/auth";

interface PropsI {
  user?: UserI | null;
}

export function ProfileSummaryCard({ user }: PropsI) {
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "Alex Duvet";

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      getAvatarSeed(user),
    )}`;

  return (
    <BrutalistCard accentColor="purple">
      <Span variant="micro" className={dashboardTheme.card.subtitle}>
        USER PROFILE
      </Span>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className={dashboardTheme.profile.avatarWrap}>
            <Image
              src={avatarUrl}
              alt={displayName}
              width={80}
              height={80}
              unoptimized
              className={dashboardTheme.profile.avatar}
            />
          </div>
          <div className={dashboardTheme.profile.verifiedBadge}>✓</div>
        </div>
        <div>
          <Heading
            as="h3"
            variant="card"
            className={dashboardTheme.profile.name}
          >
            {displayName}
          </Heading>
          <Span variant="default" className={dashboardTheme.profile.email}>
            {user?.email || "user@stampit.ai"}
          </Span>
        </div>
      </div>

      <Button type="button" variant="dashboard-edit">
        Edit Profile Protocol
      </Button>
    </BrutalistCard>
  );
}
