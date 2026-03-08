import { Calendar } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import type { UserI } from "@/types/auth";

interface DashboardHeaderProps {
  user?: UserI | null;
}

function formatLastLogin(dateValue?: string | null) {
  if (!dateValue) {
    return "Today";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const firstName = user?.user_metadata?.first_name;
  const fallbackName = user?.email?.split("@")[0];
  const displayName = firstName || fallbackName || "Creator";
  const lastLogin = formatLastLogin(user?.last_sign_in_at);

  return (
    <header className={dashboardTheme.header.container}>
      <h1 className={dashboardTheme.header.title}>
        Welcome back, {displayName}
      </h1>
      <div className={dashboardTheme.header.metaRow}>
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          Last Login: {lastLogin}
        </span>
        <span className={dashboardTheme.header.metaDot} aria-hidden="true" />
        <span>Design Tier: Pro Artist</span>
      </div>
    </header>
  );
}
